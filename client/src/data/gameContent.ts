// Generated from content/games/*.md. Client-only: no score, no persistence, so nothing
// api-side to keep in sync.

import {
  COOKING_ITEMS,
  DISHES,
  GAME_PAIRS,
  GAME_PHRASES,
  GAME_WORDS,
  HOTEL_GUESTS,
  KITCHEN,
  SHOP_ITEMS,
  TRAVEL_STOPS,
  UI_SOUNDS,
} from './gameContent.generated';
export {
  COOKING_ITEMS,
  DISHES,
  GAME_PAIRS,
  GAME_PHRASES,
  GAME_WORDS,
  HOTEL_GUESTS,
  KITCHEN,
  SHOP_ITEMS,
  TRAVEL_STOPS,
  UI_SOUNDS,
};

// `icon` keys into GameIcons.tsx; `audio` is derived from `sv` like a topic word.
export type GamePair = {
  sv: string;
  en: string;
  icon: string;
  audio: string;
  at?: string;
};

export type TravelStop = {
  sv: string;
  en: string;
  audio: string;
  lat: number;
  lon: number;
  sticker: GamePair;
};

export type GameWord = keyof typeof GAME_WORDS;

const NUMBER_WORDS: GameWord[] = ['ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio'];

/** The clip for 1-10. */
export function numberAudio(n: number): string {
  const word = NUMBER_WORDS[n - 1];
  if (!word) throw new Error(`no number word for ${n}`);
  return GAME_WORDS[word];
}

// Fits an iPad in both orientations without scrolling; clamped for a small library.
export const ROUND_SIZE = Math.min(5, GAME_PAIRS.length);

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i]!;
    const b = copy[j]!;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

/** ROUND_SIZE pairs at random. */
export function pickRound(): GamePair[] {
  return shuffled(GAME_PAIRS).slice(0, ROUND_SIZE);
}

export function randomPhrase(): string {
  return GAME_PHRASES[Math.floor(Math.random() * GAME_PHRASES.length)] ?? '';
}
