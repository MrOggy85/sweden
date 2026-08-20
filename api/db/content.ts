// Allowlists. These are the validation source of truth for everything that becomes
// part of a KV key or is rendered by the client.
//
// PAGE_IDS is generated from content/*.md by scripts/generate-content.ts — see
// content.generated.ts. client/src/data/pages.ts's PAGES comes from the same generator
// run, so the two cannot drift from each other. ANIMAL_IDS and COLOR_IDS below are still
// hand-duplicated in client/src/data/pages.ts — edit both together.

import { PAGE_IDS } from './content.generated.ts';
export { PAGE_IDS };

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
