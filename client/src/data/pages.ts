// PAGES is generated from content/*.md; PAGE_IDS in api/db/content.ts comes from the same
// run, so the two cannot drift. ANIMAL_IDS and COLOR_IDS below are still hand-duplicated
// there — edit both together. Page copy is client-only: the server stores ids.

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

// Stays a string on the client; the server narrows it via PAGE_IDS and 400s the rest.
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

// `audio` is derived from `sv` and guaranteed to exist: generate-content fails without it.
// `group` labels the row this renders under.
export type Word = {
  sv: string;
  en: string;
  audio: string;
  group?: string;
};

// Filename is authored, not derived — a meow has no spelling.
export type Sound = {
  label: string;
  audio: string;
};

// Filename authored, like a sound effect: a photograph has no text to derive one from.
export type Image = {
  caption: string;
  src: string;
};

// The client builds the embed URL, so player and privacy options live in one place.
export type Video = {
  provider: 'youtube';
  id: string;
  label: string;
};

// Absent means 'topic'.
export type PageKind = 'topic' | 'sentence';

export type Page = {
  id: string;
  kind?: PageKind;
  title: string;
  emoji: string;
  blurb: string;
  facts: string[];
  words?: Word[];
  sounds?: Sound[];
  images?: Image[];
  videos?: Video[];
  // Authored links plus backlinks. `connect` is the one id here that is not a page.
  links?: string[];
};

export const PAGE_IDS = PAGES.map((p) => p.id);

export function pageById(id: string): Page | undefined {
  return PAGES.find((p) => p.id === id);
}
