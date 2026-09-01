// PAGES is generated from content/*.md by scripts/generate-content.ts — see
// pages.generated.ts. api/db/content.ts's PAGE_IDS comes from the same generator run, so
// the two cannot drift from each other. ANIMAL_IDS and COLOR_IDS below are still
// hand-duplicated in api/db/content.ts — edit both together.
//
// The page copy (title/emoji/facts) is client-only: the server stores ids, not content.

import { PAGES } from './pages.generated';
export { PAGES };

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

// The server narrows this to a literal union via its own PAGE_IDS allowlist. On the
// client the ids come from the PAGES content array below, so it stays a string; an id the
// server does not know gets a 400 from POST /api/visits.
export type PageId = string;

export const COLORS: Record<ColorId, string> = {
  blue: '#005293',
  yellow: '#fecc00',
  red: '#d1495b',
  green: '#2a9d8f',
  purple: '#7b5ea7',
  teal: '#2d8f9e',
  orange: '#ef8354',
  pink: '#e07a9c',
};

export const ANIMAL_LABELS: Record<AnimalId, string> = {
  'moose': 'Moose',
  'fox': 'Fox',
  'lynx': 'Lynx',
  'reindeer': 'Reindeer',
  'puffin': 'Puffin',
  'hedgehog': 'Hedgehog',
  'troll': 'Troll',
  'dala-horse': 'Dala horse',
};

// One tappable vocabulary entry. `audio` is a path under /media/, derived from `sv` by
// scripts/content.ts — the clip is guaranteed to exist because generate-content fails the
// build when one is missing. `group` labels the row it renders under, when the content
// file supplies one.
export type Word = {
  sv: string;
  en: string;
  audio: string;
  group?: string;
};

// How the page renders: a fact list, or the sentence builder. Absent means 'topic'.
export type PageKind = 'topic' | 'sentence';

export type Page = {
  id: string;
  kind?: PageKind;
  title: string;
  emoji: string;
  blurb: string;
  facts: string[];
  words?: Word[];
};

export const PAGE_IDS = PAGES.map((p) => p.id);

export function pageById(id: string): Page | undefined {
  return PAGES.find((p) => p.id === id);
}
