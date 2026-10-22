// Parses content/games/*.md. Separate from the topic loader: a game pair has no
// frontmatter and no facts, and the library is sampled rather than shown in full.

import { MEDIA_DIR, parseSound, slug, type Sound } from './content.ts';

export type GamePair = {
  sv: string;
  en: string;
  // Empty only in words.md, which holds what the games say rather than show.
  icon: string;
  audio: string;
  // travel.md only: "lat,lon".
  at?: string;
};

// A travel stop, with its coordinates parsed and its sticker word looked up.
export type TravelStop = {
  sv: string;
  en: string;
  audio: string;
  lat: number;
  lon: number;
  sticker: GamePair;
};

export const GAMES_DIR = new URL('../content/games/', import.meta.url);

// The two files in content/games/ that are not pair lists.
const PHRASES_FILE = 'phrases.md';
const UI_SOUNDS_FILE = 'ui-sounds.md';

// The one pair list without pictures.
export const WORDS_FILE = 'words.md';

// What the games ask words.md for by spelling. Generated as an object keyed by these, so a
// typo in a game is a tsc error and a missing row is a build error.
export const GAME_WORD_KEYS = [
  'ett',
  'två',
  'tre',
  'fyra',
  'fem',
  'sex',
  'sju',
  'åtta',
  'nio',
  'tio',
  'hur många',
  'plus',
  'är',
  'en',
  'krona',
  'kronor',
  'tack',
  'rum',
] as const;

// What the client asks playSfx() for. Fixed here so a typo in content fails the build
// rather than silently never playing.
export const UI_SOUND_ROLES = ['tap', 'correct', 'fanfare'];

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
  const [sv, en, icon = '', at, ...rest] = item.split('|').map((part) => part.trim());
  const pictured = !filename.endsWith(WORDS_FILE);
  if (!sv || !en || (pictured && !icon) || rest.length > 0) {
    throw new Error(
      `${filename}: pair "${item}" must be written as ` +
        (pictured ? '"swedish | english | icon"' : '"swedish | english"'),
    );
  }
  if (!slug(sv)) throw new Error(`${filename}: pair "${sv}" has no letters to build a filename from`);
  const pair: GamePair = { sv, en, icon, audio: `${AUDIO_URL_PREFIX}${slug(sv)}.m4a` };
  if (at) pair.at = at;
  return pair;
}

/** travel.md, resolved: every stop needs coordinates and a sticker that has a word. */
export function travelStops(stops: GamePair[], connectPairs: GamePair[], filename: string): TravelStop[] {
  return stops.map((stop) => {
    const [lat, lon] = (stop.at ?? '').split(',').map(Number);
    if (lat === undefined || lon === undefined || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error(`${filename}: stop "${stop.sv}" needs "latitude,longitude" as its fourth field`);
    }
    const sticker = connectPairs.find((pair) => pair.icon === stop.icon);
    if (!sticker) {
      throw new Error(`${filename}: sticker "${stop.icon}" for "${stop.sv}" is not a pair in connect-pairs.md`);
    }
    return { sv: stop.sv, en: stop.en, audio: stop.audio, lat, lon, sticker };
  });
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
    if (!entry.isFile || !entry.name.endsWith('.md')) continue;
    if (entry.name === PHRASES_FILE || entry.name === UI_SOUNDS_FILE) continue;
    lists[entry.name] = await loadGamePairs(entry.name);
  }
  return lists;
}

/** Role -> its effects, in file order. More than one is a variant set. */
export async function loadUiSounds(): Promise<Record<string, Sound[]>> {
  const filename = `games/${UI_SOUNDS_FILE}`;
  const raw = await Deno.readTextFile(new URL(UI_SOUNDS_FILE, GAMES_DIR));
  const roles: Record<string, Sound[]> = {};

  for (const item of bullets(raw)) {
    const sound = parseSound(item, filename);
    if (!UI_SOUND_ROLES.includes(sound.label)) {
      throw new Error(`${filename}: unknown role "${sound.label}" — expected one of ${UI_SOUND_ROLES.join(', ')}`);
    }
    (roles[sound.label] ??= []).push(sound);
  }

  for (const role of UI_SOUND_ROLES) {
    if (!roles[role]) throw new Error(`${filename}: role "${role}" has no sound`);
  }

  return roles;
}

export async function loadGamePhrases(): Promise<string[]> {
  const filename = `games/${PHRASES_FILE}`;
  const raw = await Deno.readTextFile(new URL(PHRASES_FILE, GAMES_DIR));
  const phrases = bullets(raw);
  if (phrases.length === 0) throw new Error(`${filename}: no phrases found`);
  return phrases;
}
