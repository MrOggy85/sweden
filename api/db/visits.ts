import kv from './kv.ts';
import { k } from './keys.ts';
import type { PageProgress, Visit } from './types.ts';

/**
 * History is a rolling window; the aggregates are the durable state. That split is what
 * bounds storage by traffic rate rather than by lifetime.
 */
const VISIT_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export const VISITS_LIMIT_DEFAULT = 50;
export const VISITS_LIMIT_MAX = 100;
export const CURSOR_MAX = 512;

/** Breaks ties between visits landing in the same millisecond. Order within a ms is arbitrary. */
function seq(): string {
  return Math.trunc(Math.random() * 36 ** 6).toString(36).padStart(6, '0');
}

/**
 * One interaction is one atomic write. Every mutation is blind (`sum` / `set`, no
 * `check`), so this never fails on a versionstamp conflict — which matters most for
 * ['pageTotal', pageId], a global hotspot that a read-modify-write would turn into a
 * conflict storm.
 */
export async function recordVisit(userId: string, visit: Visit): Promise<number> {
  await kv.atomic()
    .set(k.visit(userId, visit.at, seq()), visit, { expireIn: VISIT_TTL_MS })
    .sum(k.pageCount(userId, visit.pageId), 1n)
    .set(k.pageLastAt(userId, visit.pageId), visit.at)
    .sum(k.userTotal(userId), 1n)
    .sum(k.pageTotal(visit.pageId), 1n)
    .commit();

  const count = await kv.get<Deno.KvU64>(k.pageCount(userId, visit.pageId));
  return Number(count.value?.value ?? 0n);
}

export async function listVisits(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<{ items: Visit[]; cursor: string | null }> {
  const iter = kv.list<Visit>(
    { prefix: k.visitsPrefix(userId) },
    { reverse: true, limit, ...(cursor ? { cursor } : {}) },
  );

  const items: Visit[] = [];
  for await (const entry of iter) items.push(entry.value);

  // A short page means the range is exhausted; reporting a cursor then would make the
  // client fetch an empty page before stopping.
  return { items, cursor: items.length === limit ? iter.cursor : null };
}

/**
 * One prefix scan returns the 'c' (count) and 't' (last seen) siblings for every page,
 * so building the whole progress map never touches the visit log.
 */
export async function listPageProgress(userId: string): Promise<{ pages: PageProgress[]; total: number }> {
  const counts = new Map<string, number>();
  const lastAt = new Map<string, number>();

  for await (const entry of kv.list({ prefix: k.pageStatPrefix(userId) })) {
    const pageId = entry.key[2];
    const field = entry.key[3];
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
}
