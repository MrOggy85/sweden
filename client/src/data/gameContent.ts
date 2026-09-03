// Generated from content/games/*.md. Client-only: no score, no persistence, so nothing
// api-side to keep in sync.

import { COOKING_ITEMS, DISHES, GAME_PAIRS, GAME_PHRASES, KITCHEN } from './gameContent.generated';
export { COOKING_ITEMS, DISHES, GAME_PAIRS, GAME_PHRASES, KITCHEN };

// `icon` keys into GameIcons.tsx; `audio` is derived from `sv` like a topic word.
export type GamePair = {
  sv: string;
  en: string;
  icon: string;
  audio: string;
};

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
