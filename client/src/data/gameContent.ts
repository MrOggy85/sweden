// GAME_PAIRS/GAME_PHRASES are generated from content/games/*.md by
// scripts/generate-game-content.ts — see gameContent.generated.ts. Client-only: this game
// has no server-side validation or persistence (no lives, no score, no saved progress by
// design), so there is no api-side counterpart to keep in sync.

import { GAME_PAIRS, GAME_PHRASES } from './gameContent.generated';
export { GAME_PAIRS, GAME_PHRASES };

// One word/image pair in the library. `icon` keys into GameIcons.tsx's icon set; `audio` is
// a path under /media/, derived from `sv` the same way topic words are — the clip is
// guaranteed to exist because generate-content fails the build when one is missing.
export type GamePair = {
  sv: string;
  en: string;
  icon: string;
  audio: string;
};

// How many pairs make up one round. Chosen to fit an iPad screen in both orientations
// without scrolling; clamped in case the library is ever smaller than this.
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

/** Picks ROUND_SIZE pairs at random for a new round. */
export function pickRound(): GamePair[] {
  return shuffled(GAME_PAIRS).slice(0, ROUND_SIZE);
}

export function randomPhrase(): string {
  return GAME_PHRASES[Math.floor(Math.random() * GAME_PHRASES.length)] ?? '';
}
