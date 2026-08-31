// Parses content/games/*.md for the "connect the words" game. Deliberately separate from
// scripts/content.ts's topic loader: a game pair isn't a topic (no frontmatter, no facts,
// and it carries an icon id instead of prose), and this library is picked from at random
// rather than shown in full.
//
// Shared by scripts/generate-game-content.ts and scripts/generate-audio.ts, the same way
// scripts/content.ts is shared by the topic equivalents of those two scripts.

import { MEDIA_DIR, slug } from './content.ts';

export type GamePair = {
  sv: string;
  en: string;
  icon: string;
  audio: string;
};

export const GAMES_DIR = new URL('../content/games/', import.meta.url);

// Where the browser asks for a clip — see scripts/content.ts's identical constant.
const AUDIO_URL_PREFIX = '/media/';

export function gamePairAudioUrl(pair: GamePair): URL {
  return new URL(`${slug(pair.sv)}.m4a`, MEDIA_DIR);
}

// Bullets anywhere in the file; everything else (a leading explanation, blank lines) is
// ignored, so the file can carry a short comment for whoever adds the next pair.
function bullets(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

function parsePair(item: string, filename: string): GamePair {
  const [sv, en, icon, ...rest] = item.split('|').map((part) => part.trim());
  if (!sv || !en || !icon || rest.length > 0) {
    throw new Error(`${filename}: pair "${item}" must be written as "swedish | english | icon"`);
  }
  if (!slug(sv)) throw new Error(`${filename}: pair "${sv}" has no letters to build a filename from`);
  return { sv, en, icon, audio: `${AUDIO_URL_PREFIX}${slug(sv)}.m4a` };
}

export async function loadGamePairs(): Promise<GamePair[]> {
  const filename = 'games/connect-pairs.md';
  const raw = await Deno.readTextFile(new URL('connect-pairs.md', GAMES_DIR));
  const pairs = bullets(raw).map((item) => parsePair(item, filename));
  if (pairs.length === 0) throw new Error(`${filename}: no pairs found`);

  const seen = new Set<string>();
  for (const pair of pairs) {
    if (seen.has(pair.sv)) throw new Error(`${filename}: duplicate word "${pair.sv}"`);
    seen.add(pair.sv);
  }

  return pairs;
}

export async function loadGamePhrases(): Promise<string[]> {
  const filename = 'games/phrases.md';
  const raw = await Deno.readTextFile(new URL('phrases.md', GAMES_DIR));
  const phrases = bullets(raw);
  if (phrases.length === 0) throw new Error(`${filename}: no phrases found`);
  return phrases;
}
