// Deno KV implementation of Store: local dev (KV_PATH, SQLite) and Deno Deploy (managed KV).
// Key layout lives in keys.ts; read its comments before changing anything here.

import { k } from './keys.ts';
import { EMPTY_DEVICE_TTL_MS, type Store, VISIT_TTL_MS } from './store.ts';
import type { Device, PageProgress, User, Visit } from './types.ts';

function deviceOptions(device: Device): { expireIn: number } | undefined {
  return device.userIds.length > 0 ? undefined : { expireIn: EMPTY_DEVICE_TTL_MS };
}

/** Breaks ties between visits landing in the same millisecond. Order within a ms is arbitrary. */
function seq(): string {
  return Math.trunc(Math.random() * 36 ** 6).toString(36).padStart(6, '0');
}

export function kvStore(kv: Deno.Kv): Store {
  async function deletePrefix(prefix: Deno.KvKey): Promise<void> {
    const BATCH = 500;
    while (true) {
      const keys: Deno.KvKey[] = [];
      for await (const entry of kv.list({ prefix }, { limit: BATCH })) {
        keys.push(entry.key);
      }
      if (keys.length === 0) return;

      let atomic = kv.atomic();
      for (const key of keys) atomic = atomic.delete(key);
      await atomic.commit();

      if (keys.length < BATCH) return;
    }
  }

  return {
    async getDevice(deviceId) {
      return (await kv.get<Device>(k.device(deviceId))).value;
    },

    async putDevice(device) {
      await kv.set(k.device(device.id), device, deviceOptions(device));
    },

    async getUser(userId) {
      return (await kv.get<User>(k.user(userId))).value;
    },

    async createUser(user, device) {
      // Writing the device without expireIn is what makes it permanent.
      await kv.atomic()
        .set(k.user(user.id), user)
        .set(k.device(device.id), device)
        .commit();
    },

    async putUser(user) {
      await kv.set(k.user(user.id), user);
    },

    async removeUser(userId, device) {
      await deletePrefix(k.visitsPrefix(userId));
      await deletePrefix(k.pageStatPrefix(userId));
      await kv.atomic()
        .delete(k.user(userId))
        .delete(k.userTotal(userId))
        .set(k.device(device.id), device)
        .commit();
    },

    // One interaction is one atomic write. Every mutation is blind (`sum` / `set`, no
    // `check`), so this never fails on a versionstamp conflict — which matters most for
    // ['pageTotal', pageId], a global hotspot that a read-modify-write would turn into a
    // conflict storm.
    async recordVisit(userId, visit) {
      await kv.atomic()
        .set(k.visit(userId, visit.at, seq()), visit, { expireIn: VISIT_TTL_MS })
        .sum(k.pageCount(userId, visit.pageId), 1n)
        .set(k.pageLastAt(userId, visit.pageId), visit.at)
        .sum(k.userTotal(userId), 1n)
        .sum(k.pageTotal(visit.pageId), 1n)
        .commit();

      const count = await kv.get<Deno.KvU64>(k.pageCount(userId, visit.pageId));
      return Number(count.value?.value ?? 0n);
    },

    async listVisits(userId, limit, cursor) {
      const iter = kv.list<Visit>(
        { prefix: k.visitsPrefix(userId) },
        { reverse: true, limit, ...(cursor ? { cursor } : {}) },
      );

      const items: Visit[] = [];
      for await (const entry of iter) items.push(entry.value);

      // A short page means the range is exhausted; reporting a cursor then would make the
      // client fetch an empty page before stopping.
      return { items, cursor: items.length === limit ? iter.cursor : null };
    },

    // One prefix scan returns the 'c' (count) and 't' (last seen) siblings for every page,
    // so building the whole progress map never touches the visit log.
    async listPageProgress(userId) {
      const counts = new Map<string, number>();
      const lastAt = new Map<string, number>();

      for await (const entry of kv.list({ prefix: k.pageStatPrefix(userId) })) {
        const pageId = entry.key[3];
        const field = entry.key[4];
        if (typeof pageId !== 'string') continue;

        if (field === 'c') {
          counts.set(pageId, Number((entry.value as Deno.KvU64).value));
        } else if (field === 't') {
          lastAt.set(pageId, entry.value as number);
        }
      }

      const pages: PageProgress[] = [...counts.entries()]
        .map(([pageId, count]) => ({ pageId, count, lastAt: lastAt.get(pageId) ?? 0 }))
        .sort((a, b) => b.lastAt - a.lastAt);

      const total = await kv.get<Deno.KvU64>(k.userTotal(userId));
      return { pages, total: Number(total.value?.value ?? 0n) };
    },

    async ping() {
      await kv.get(k.health());
    },
  };
}
