import { EMPTY_DEVICE_TTL_MS, type Store, VISIT_TTL_MS } from '../../api/db/store.ts';
import type { Device, PageProgress, User, Visit } from '../../api/db/types.ts';
import type { AnimalId, ColorId, PageId, VisitKind } from '../../api/db/content.ts';

type DeviceRow = { id: string; user_ids: string; active_user_id: string | null; created_at: number };
type UserRow = { id: string; name: string; animal: string; color: string; created_at: number; updated_at: number };
type VisitRow = { id: number; at: number; page_id: string; kind: string; ms: number | null; score: number | null };

const CURSOR_RE = /^(\d{1,16}):(\d{1,16})$/;

function toUser(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    avatar: { animal: r.animal as AnimalId, color: r.color as ColorId },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    version: 1,
  };
}

function toVisit(r: VisitRow): Visit {
  const v: Visit = { pageId: r.page_id as PageId, kind: r.kind as VisitKind, at: r.at };
  if (r.ms !== null) v.ms = r.ms;
  if (r.score !== null) v.score = r.score;
  return v;
}

/** Same rule as KV's expireIn: an empty device expires, one with a profile is permanent. */
function expiresAt(device: Device): number | null {
  return device.userIds.length > 0 ? null : device.createdAt + EMPTY_DEVICE_TTL_MS;
}

export function d1Store(db: D1Database): Store {
  const upsertDevice = (d: Device) =>
    db.prepare(
      `INSERT INTO devices (id, user_ids, active_user_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET user_ids = excluded.user_ids,
         active_user_id = excluded.active_user_id, expires_at = excluded.expires_at`,
    ).bind(d.id, JSON.stringify(d.userIds), d.activeUserId, d.createdAt, expiresAt(d));

  const upsertUser = (u: User) =>
    db.prepare(
      `INSERT INTO users (id, name, animal, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET name = excluded.name, animal = excluded.animal,
         color = excluded.color, updated_at = excluded.updated_at`,
    ).bind(u.id, u.name, u.avatar.animal, u.avatar.color, u.createdAt, u.updatedAt);

  return {
    async getDevice(deviceId) {
      const r = await db.prepare(
        `SELECT id, user_ids, active_user_id, created_at FROM devices
         WHERE id = ? AND (expires_at IS NULL OR expires_at > ?)`,
      ).bind(deviceId, Date.now()).first<DeviceRow>();
      if (!r) return null;
      return {
        id: r.id,
        userIds: JSON.parse(r.user_ids) as string[],
        activeUserId: r.active_user_id,
        createdAt: r.created_at,
        version: 1,
      };
    },

    async putDevice(device) {
      await upsertDevice(device).run();
    },

    async getUser(userId) {
      const r = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<UserRow>();
      return r ? toUser(r) : null;
    },

    async createUser(user, device) {
      // A D1 batch is one transaction.
      await db.batch([upsertUser(user), upsertDevice(device)]);
    },

    async putUser(user) {
      await upsertUser(user).run();
    },

    async removeUser(userId, device) {
      await db.batch([
        db.prepare('DELETE FROM visits WHERE user_id = ?').bind(userId),
        db.prepare('DELETE FROM page_stats WHERE user_id = ?').bind(userId),
        db.prepare('DELETE FROM users WHERE id = ?').bind(userId),
        upsertDevice(device),
      ]);
    },

    // One batch, one transaction, and every write is a blind upsert, as in KV.
    async recordVisit(userId, visit) {
      const results = await db.batch<{ count: number }>([
        db.prepare('INSERT INTO visits (user_id, at, page_id, kind, ms, score) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(userId, visit.at, visit.pageId, visit.kind, visit.ms ?? null, visit.score ?? null),
        db.prepare(
          `INSERT INTO page_stats (user_id, page_id, count, last_at) VALUES (?, ?, 1, ?)
           ON CONFLICT (user_id, page_id) DO UPDATE SET count = count + 1, last_at = excluded.last_at`,
        ).bind(userId, visit.pageId, visit.at),
        db.prepare(
          `INSERT INTO page_totals (page_id, total) VALUES (?, 1)
           ON CONFLICT (page_id) DO UPDATE SET total = total + 1`,
        ).bind(visit.pageId),
        db.prepare('SELECT count FROM page_stats WHERE user_id = ? AND page_id = ?').bind(userId, visit.pageId),
      ]);
      return results[3].results[0]?.count ?? 0;
    },

    // Keyset paging: the cursor is "<at>:<id>" of the last row returned. Rows past the
    // 180-day window are hidden even before the cron deletes them, as KV's expireIn did.
    async listVisits(userId, limit, cursor) {
      const since = Date.now() - VISIT_TTL_MS;
      let stmt;
      if (cursor) {
        const m = CURSOR_RE.exec(cursor);
        if (!m) throw new Error('invalid cursor');
        stmt = db.prepare(
          `SELECT id, at, page_id, kind, ms, score FROM visits
           WHERE user_id = ? AND at > ? AND (at < ? OR (at = ? AND id < ?))
           ORDER BY at DESC, id DESC LIMIT ?`,
        ).bind(userId, since, Number(m[1]), Number(m[1]), Number(m[2]), limit);
      } else {
        stmt = db.prepare(
          `SELECT id, at, page_id, kind, ms, score FROM visits
           WHERE user_id = ? AND at > ? ORDER BY at DESC, id DESC LIMIT ?`,
        ).bind(userId, since, limit);
      }
      const rows = (await stmt.all<VisitRow>()).results;
      const last = rows[rows.length - 1];
      // A short page means the range is exhausted; no cursor then.
      return { items: rows.map(toVisit), cursor: rows.length === limit && last ? `${last.at}:${last.id}` : null };
    },

    async listPageProgress(userId) {
      const rows = (await db.prepare(
        'SELECT page_id, count, last_at FROM page_stats WHERE user_id = ? ORDER BY last_at DESC',
      ).bind(userId).all<{ page_id: string; count: number; last_at: number }>()).results;
      const pages: PageProgress[] = rows.map((r) => ({ pageId: r.page_id, count: r.count, lastAt: r.last_at }));
      return { pages, total: pages.reduce((n, p) => n + p.count, 0) };
    },

    async ping() {
      await db.prepare('SELECT 1').first();
    },
  };
}

/** Daily housekeeping (the cron in wrangler.jsonc): expired empty devices and old history. */
export async function prune(db: D1Database): Promise<{ devices: number; visits: number }> {
  const now = Date.now();
  const [d, v] = await db.batch([
    db.prepare('DELETE FROM devices WHERE expires_at IS NOT NULL AND expires_at <= ?').bind(now),
    db.prepare('DELETE FROM visits WHERE at <= ?').bind(now - VISIT_TTL_MS),
  ]);
  return { devices: d.meta.changes ?? 0, visits: v.meta.changes ?? 0 };
}
