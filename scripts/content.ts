// Parses content/*.md (one Markdown file per topic, YAML-ish frontmatter + a bullet list
// of facts, optionally a `## Words` section) into the Page shape both generators emit.
//
// Shared by scripts/generate-content.ts and scripts/generate-audio.ts so the audio
// filenames the app asks for and the ones the TTS script writes come from one slug
// function and cannot drift.
//
// No YAML library and no schema validator: the frontmatter here is flat scalar
// `key: value` pairs, so a full parser buys nothing, and the checks below fail loudly
// enough (file name + missing field) that a validator would mostly repeat the message.

export type Word = {
  sv: string;
  en: string;
  audio: string;
  // Optional third field on a word row, used to group the buttons. Groups render in the
  // order they first appear in the file, so the content file controls the layout.
  group?: string;
};

// A sound effect: a label and a file under client/static/media/sfx/. Unlike a word clip,
// the filename is authored rather than derived — a meow has no spelling to derive it from.
export type Sound = {
  label: string;
  audio: string;
};

// How the client renders the page: a fact list, or the tap-a-word sentence builder.
export const PAGE_KINDS = ['topic', 'sentence'] as const;
export type PageKind = typeof PAGE_KINDS[number];

export type Page = {
  id: string;
  order: number;
  kind: PageKind;
  title: string;
  emoji: string;
  blurb: string;
  facts: string[];
  words: Word[];
  sounds: Sound[];
};

// Page ids become URLs (`/flag`), so anything the client routes itself is off limits — a
// content/dev.md would be unreachable behind the diagnostics area.
const RESERVED_IDS = ['dev', 'api', 'media', 'connect'];

export const CONTENT_DIR = new URL('../content/', import.meta.url);
export const MEDIA_DIR = new URL('../client/static/media/', import.meta.url);
export const SFX_DIR = new URL('../client/static/media/sfx/', import.meta.url);

// Where the browser asks for a clip. client/static/media/ is copied to api/client/media/
// by the build, and api/server.ts serves anything ending in .m4a from there.
const AUDIO_URL_PREFIX = '/media/';
const SFX_URL_PREFIX = '/media/sfx/';

// What `make convert-sfx` accepts as input and turns into .m4a. Anything with one of these
// extensions left in sfx/ is an unconverted download: generate-content refuses it, because
// the build copies static/ wholesale and it would otherwise ship alongside its own output.
export const SFX_SOURCE_EXTENSIONS = ['.mp3', '.wav', '.aif', '.aiff', '.caf', '.m4v', '.mp4', '.ogg'];

// The audio filename is derived from the Swedish word, never authored, so content files
// stay free of file paths and a clip cannot be pointed at the wrong word.
export function slug(sv: string): string {
  return sv
    .toLowerCase()
    .replaceAll('å', 'a')
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function audioFileUrl(word: Word): URL {
  return new URL(`${slug(word.sv)}.m4a`, MEDIA_DIR);
}

export function soundFileUrl(sound: Sound): URL {
  return new URL(sound.audio.slice(SFX_URL_PREFIX.length), SFX_DIR);
}

function parseFrontmatter(raw: string, filename: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!match) throw new Error(`${filename}: unparseable frontmatter line: ${JSON.stringify(line)}`);
    fields[match[1]] = match[2].trim();
  }
  return fields;
}

function parseWord(item: string, filename: string): Word {
  const [sv, en, group, ...rest] = item.split('|').map((part) => part.trim());
  if (!sv || !en || rest.length > 0) {
    throw new Error(
      `${filename}: word "${item}" must be written as "swedish | english" or "swedish | english | group"`,
    );
  }
  if (!slug(sv)) throw new Error(`${filename}: word "${sv}" has no letters to build a filename from`);
  const word: Word = { sv, en, audio: `${AUDIO_URL_PREFIX}${slug(sv)}.m4a` };
  if (group) word.group = group;
  return word;
}

function parseSound(item: string, filename: string): Sound {
  const [label, file, ...rest] = item.split('|').map((part) => part.trim());
  if (!label || !file || rest.length > 0) {
    throw new Error(`${filename}: sound "${item}" must be written as "label | filename-without-extension"`);
  }
  if (file.includes('/') || file.includes('.')) {
    throw new Error(`${filename}: sound file "${file}" must be a bare name — the folder and .m4a are implied`);
  }
  return { label, audio: `${SFX_URL_PREFIX}${file}.m4a` };
}

// Bullets before the first `##` heading are facts; bullets under `## Words` are
// vocabulary and under `## Sounds` are effects. Bullets under any other heading are
// ignored, so prose sections can be added to a topic without turning into facts.
function parseBody(body: string, filename: string): { facts: string[]; words: Word[]; sounds: Sound[] } {
  const facts: string[] = [];
  const words: Word[] = [];
  const sounds: Sound[] = [];
  let section: 'facts' | 'words' | 'sounds' | 'other' = 'facts';

  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.*?)\s*$/);
    if (heading) {
      const name = heading[1].toLowerCase();
      section = name === 'words' ? 'words' : name === 'sounds' ? 'sounds' : 'other';
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;
    const item = trimmed.slice(2).trim();

    if (section === 'facts') facts.push(item);
    else if (section === 'words') words.push(parseWord(item, filename));
    else if (section === 'sounds') sounds.push(parseSound(item, filename));
  }

  return { facts, words, sounds };
}

function requireField(fields: Record<string, string>, name: string, filename: string): string {
  const value = fields[name];
  if (!value) throw new Error(`${filename}: missing required frontmatter field "${name}"`);
  return value;
}

async function loadPage(entryName: string): Promise<Page> {
  const stem = entryName.replace(/\.md$/, '');
  const raw = await Deno.readTextFile(new URL(entryName, CONTENT_DIR));

  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!frontmatterMatch) throw new Error(`${entryName}: expected leading --- frontmatter block`);
  const [, frontmatterRaw, body] = frontmatterMatch;

  const fields = parseFrontmatter(frontmatterRaw, entryName);

  const id = requireField(fields, 'id', entryName);
  if (id !== stem) throw new Error(`${entryName}: frontmatter id "${id}" must match the filename ("${stem}")`);
  if (RESERVED_IDS.includes(id)) {
    throw new Error(`${entryName}: id "${id}" is reserved — it is a route, so the page would be unreachable`);
  }

  const orderRaw = requireField(fields, 'order', entryName);
  const order = Number(orderRaw);
  if (!Number.isFinite(order)) throw new Error(`${entryName}: order "${orderRaw}" is not a number`);

  const title = requireField(fields, 'title', entryName);
  const emoji = requireField(fields, 'emoji', entryName);
  const blurb = requireField(fields, 'blurb', entryName);

  // Optional: a page with no `kind` is an ordinary fact list.
  const kind = (fields.kind ?? 'topic') as PageKind;
  if (!PAGE_KINDS.includes(kind)) {
    throw new Error(`${entryName}: kind "${kind}" must be one of ${PAGE_KINDS.join(', ')}`);
  }

  const { facts, words, sounds } = parseBody(body, entryName);
  if (facts.length === 0) throw new Error(`${entryName}: no facts found — expected a Markdown bullet list ("- ...")`);

  return { id, order, kind, title, emoji, blurb, facts, words, sounds };
}

export async function loadPages(): Promise<Page[]> {
  const entries: string[] = [];
  for await (const entry of Deno.readDir(CONTENT_DIR)) {
    if (entry.isFile && entry.name.endsWith('.md')) entries.push(entry.name);
  }
  if (entries.length === 0) throw new Error(`no content found in ${CONTENT_DIR.pathname}`);

  const pages = await Promise.all(entries.map(loadPage));
  pages.sort((a, b) => a.order - b.order);

  const seen = new Set<string>();
  for (const page of pages) {
    if (seen.has(page.id)) throw new Error(`duplicate content id: "${page.id}"`);
    seen.add(page.id);
  }

  return pages;
}
