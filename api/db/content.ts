// Allowlists. These are the validation source of truth for everything that becomes
// part of a KV key or is rendered by the client.
//
// PAGE_IDS is duplicated in client/src/data/pages.ts — edit both together. Drift shows
// up as a 400 from POST /api/visits, and GET /api/health reports the server's count so
// a mismatch is visible during development.

export const ANIMAL_IDS = [
  'moose',
  'fox',
  'lynx',
  'reindeer',
  'puffin',
  'hedgehog',
  'troll',
  'dala-horse',
] as const;

export const COLOR_IDS = [
  'blue',
  'yellow',
  'red',
  'green',
  'purple',
  'teal',
  'orange',
  'pink',
] as const;

export const VISIT_KINDS = ['view', 'quiz'] as const;

export const PAGE_IDS = [
  'flag',
  'map',
  'stockholm',
  'fika',
  'midsummer',
  'animals',
  'language',
  'winter',
] as const;

export type AnimalId = typeof ANIMAL_IDS[number];
export type ColorId = typeof COLOR_IDS[number];
export type VisitKind = typeof VISIT_KINDS[number];
export type PageId = typeof PAGE_IDS[number];

export function isPageId(value: unknown): value is PageId {
  return typeof value === 'string' && (PAGE_IDS as readonly string[]).includes(value);
}

export function isVisitKind(value: unknown): value is VisitKind {
  return typeof value === 'string' && (VISIT_KINDS as readonly string[]).includes(value);
}
