// Every KV key in the app is built here, so the key layout can be read in one place.
//
// Ordering notes that matter:
//  - userId is the SECOND part of a visit key, so listing one user's history is a
//    contiguous prefix scan instead of a full scan.
//  - `at` is stored ascending and read with { reverse: true }. No inverted-timestamp
//    trick, and it must always be a `number` — KV orders bigint after number, so mixing
//    the two in that position would break ordering.
//  - Per-page count and last-seen are SIBLING keys ('c' / 't') rather than one object,
//    because Deno.KvU64 cannot be nested inside a value. A single prefix scan over
//    ['pageStat', userId] still returns both for every page.
//  - APP is the FIRST part of every key. Deno Deploy KV is shared across this account's
//    projects, so this is what keeps `sweden`'s data from colliding with another
//    project's keys of the same shape. Never construct a key without going through `k`.

const APP = 'sweden';

export const k = {
  user: (userId: string): Deno.KvKey => [APP, 'user', userId],
  device: (deviceId: string): Deno.KvKey => [APP, 'device', deviceId],

  visit: (userId: string, at: number, seq: string): Deno.KvKey => [APP, 'visit', userId, at, seq],
  visitsPrefix: (userId: string): Deno.KvKey => [APP, 'visit', userId],

  pageCount: (userId: string, pageId: string): Deno.KvKey => [APP, 'pageStat', userId, pageId, 'c'],
  pageLastAt: (userId: string, pageId: string): Deno.KvKey => [APP, 'pageStat', userId, pageId, 't'],
  pageStatPrefix: (userId: string): Deno.KvKey => [APP, 'pageStat', userId],

  userTotal: (userId: string): Deno.KvKey => [APP, 'userTotal', userId],
  pageTotal: (pageId: string): Deno.KvKey => [APP, 'pageTotal', pageId],

  health: (): Deno.KvKey => [APP, 'health'],
} as const;
