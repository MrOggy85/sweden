// Parses content/games/*.md. Separate from the topic loader: a game pair has no
// frontmatter and no facts, and the library is sampled rather than shown in full.

import { MEDIA_DIR, slug } from './content.ts';

export type GamePair = {
  sv: string;
  en: string;
  icon: string;
  audio: string;
};

export const GAMES_DIR = new URL('../content/games/', import.meta.url);

// The one file in content/games/ that is not a pair list.
const PHRASES_FILE = 'phrases.md';

// Same as scripts/content.ts's constant.
const AUDIO_URL_PREFIX = '/media/';

export function gamePairAudioUrl(pair: GamePair): URL {
  return new URL(`${slug(pair.sv)}.m4a`, MEDIA_DIR);
}

// Bullets anywhere; everything else is ignored, so the file can explain itself.
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

/** One list of `swedish | english | icon` bullets: the connect pairs, the shelf, the dishes. */
export async function loadGamePairs(file: string): Promise<GamePair[]> {
  const filename = `games/${file}`;
  const raw = await Deno.readTextFile(new URL(file, GAMES_DIR));
  const pairs = bullets(raw).map((item) => parsePair(item, filename));
  if (pairs.length === 0) throw new Error(`${filename}: no pairs found`);

  const seen = new Set<string>();
  for (const pair of pairs) {
    if (seen.has(pair.sv)) throw new Error(`${filename}: duplicate word "${pair.sv}"`);
    seen.add(pair.sv);
  }

  return pairs;
}

/**
 * Every pair list in content/games/, keyed by filename. Scanned rather than listed, so
 * adding a game's word list cannot leave one script generating its clips and another
 * checking for them.
 */
export async function loadAllGamePairs(): Promise<Record<string, GamePair[]>> {
  const lists: Record<string, GamePair[]> = {};
  for await (const entry of Deno.readDir(GAMES_DIR)) {
    if (!entry.isFile || !entry.name.endsWith('.md') || entry.name === PHRASES_FILE) continue;
    lists[entry.name] = await loadGamePairs(entry.name);
  }
  return lists;
}

export async function loadGamePhrases(): Promise<string[]> {
  const filename = `games/${PHRASES_FILE}`;
  const raw = await Deno.readTextFile(new URL(PHRASES_FILE, GAMES_DIR));
  const phrases = bullets(raw);
  if (phrases.length === 0) throw new Error(`${filename}: no phrases found`);
  return phrases;
}
