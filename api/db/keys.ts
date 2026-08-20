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

export const k = {
  user: (userId: string): Deno.KvKey => ['user', userId],
  device: (deviceId: string): Deno.KvKey => ['device', deviceId],

  visit: (userId: string, at: number, seq: string): Deno.KvKey => ['visit', userId, at, seq],
  visitsPrefix: (userId: string): Deno.KvKey => ['visit', userId],

  pageCount: (userId: string, pageId: string): Deno.KvKey => ['pageStat', userId, pageId, 'c'],
  pageLastAt: (userId: string, pageId: string): Deno.KvKey => ['pageStat', userId, pageId, 't'],
  pageStatPrefix: (userId: string): Deno.KvKey => ['pageStat', userId],

  userTotal: (userId: string): Deno.KvKey => ['userTotal', userId],
  pageTotal: (pageId: string): Deno.KvKey => ['pageTotal', pageId],

  health: (): Deno.KvKey => ['health'],
} as const;
