// Parses content/*.md into the Page shape. Shared by generate-content and generate-audio,
// so clip filenames come from one slug() and cannot drift. Format: CLAUDE.md.
//
// No YAML library: the frontmatter is flat `key: value`, and the checks below name the file
// and field anyway.

export type Word = {
  sv: string;
  en: string;
  audio: string;
  // Optional third field; groups render in the order they first appear in the file.
  group?: string;
};

// Filename is authored, not derived — a meow has no spelling.
export type Sound = {
  label: string;
  audio: string;
};

// A photo under media/img/, with the caption shown under it. Filename authored, like a
// sound effect: a photograph has no text to derive one from.
export type Image = {
  caption: string;
  src: string;
};

// Only YouTube for now, and only the id: the client builds the embed URL, so the privacy
// and player options are decided in one place rather than per content file.
export type Video = {
  provider: 'youtube';
  id: string;
  label: string;
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
  images: Image[];
  videos: Video[];
  // Authored in `## Links`, plus the reverse of every link pointing here. Ids, never
  // labels: the card comes from the target page.
  links: string[];
};

// Page ids become URLs, so anything the client routes itself is off limits.
const RESERVED_IDS = ['dev', 'api', 'media', 'connect'];

// Linkable but not content pages. No backlink: there is no file to render one on.
const LINKABLE_ROUTES = ['connect'];

export const CONTENT_DIR = new URL('../content/', import.meta.url);
export const MEDIA_DIR = new URL('../client/static/media/', import.meta.url);
export const SFX_DIR = new URL('../client/static/media/sfx/', import.meta.url);
export const IMG_DIR = new URL('../client/static/media/img/', import.meta.url);

// Where the browser asks for a clip; the build copies static/ into api/client/.
const AUDIO_URL_PREFIX = '/media/';
const SFX_URL_PREFIX = '/media/sfx/';
const IMG_URL_PREFIX = '/media/img/';

// `make convert-sfx` inputs. One left in sfx/ is an unconverted download, and would ship
// beside its own output — generate-content refuses it.
export const SFX_SOURCE_EXTENSIONS = ['.mp3', '.wav', '.aif', '.aiff', '.caf', '.m4v', '.mp4', '.ogg'];

// Derived, never authored: content carries no paths, and a clip cannot point at the wrong
// word.
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

export function imageFileUrl(image: Image): URL {
  return new URL(image.src.slice(IMG_URL_PREFIX.length), IMG_DIR);
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

function parseImage(item: string, filename: string): Image {
  const [caption, file, ...rest] = item.split('|').map((part) => part.trim());
  if (!caption || !file || rest.length > 0) {
    throw new Error(`${filename}: image "${item}" must be written as "caption | filename.jpg"`);
  }
  if (file.includes('/')) throw new Error(`${filename}: image "${file}" must be a bare name — media/img/ is implied`);
  return { caption, src: `${IMG_URL_PREFIX}${file}` };
}

function parseVideo(item: string, filename: string): Video {
  const [provider, id, label, ...rest] = item.split('|').map((part) => part.trim());
  if (provider !== 'youtube' || !id || !label || rest.length > 0) {
    throw new Error(`${filename}: video "${item}" must be written as "youtube | id | label"`);
  }
  // A YouTube id is exactly 11 of these characters; anything else is a pasted URL.
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
    throw new Error(`${filename}: video id "${id}" is not a YouTube id — use the id, not the whole URL`);
  }
  return { provider, id, label };
}

function parseLink(item: string, filename: string): string {
  if (!/^[a-z0-9-]+$/.test(item)) {
    throw new Error(`${filename}: link "${item}" must be a bare page id — the card comes from the target page`);
  }
  return item;
}

type Body = {
  facts: string[];
  words: Word[];
  sounds: Sound[];
  images: Image[];
  videos: Video[];
  links: string[];
};

// Bullets before the first `##` are facts; the rest go by heading. Bullets under any other
// heading are ignored, so prose sections do not become facts.
function parseBody(body: string, filename: string): Body {
  const facts: string[] = [];
  const words: Word[] = [];
  const sounds: Sound[] = [];
  const images: Image[] = [];
  const videos: Video[] = [];
  const links: string[] = [];
  let section: 'facts' | 'words' | 'sounds' | 'images' | 'video' | 'links' | 'other' = 'facts';

  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.*?)\s*$/);
    if (heading) {
      const name = heading[1].toLowerCase();
      section = name === 'words' || name === 'sounds' || name === 'images' || name === 'video' || name === 'links'
        ? name
        : 'other';
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;
    const item = trimmed.slice(2).trim();

    if (section === 'facts') facts.push(item);
    else if (section === 'words') words.push(parseWord(item, filename));
    else if (section === 'sounds') sounds.push(parseSound(item, filename));
    else if (section === 'images') images.push(parseImage(item, filename));
    else if (section === 'video') videos.push(parseVideo(item, filename));
    else if (section === 'links') links.push(parseLink(item, filename));
  }

  return { facts, words, sounds, images, videos, links };
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

  const { facts, words, sounds, images, videos, links } = parseBody(body, entryName);
  if (facts.length === 0) throw new Error(`${entryName}: no facts found — expected a Markdown bullet list ("- ...")`);

  return { id, order, kind, title, emoji, blurb, facts, words, sounds, images, videos, links };
}

// Needs every page loaded first. A bad id would render a card that navigates nowhere.
function assertLinksResolve(pages: Page[]): void {
  const ids = new Set(pages.map((p) => p.id));

  for (const page of pages) {
    const seen = new Set<string>();
    for (const link of page.links) {
      if (link === page.id) throw new Error(`${page.id}.md: links to itself`);
      if (seen.has(link)) throw new Error(`${page.id}.md: links to "${link}" twice`);
      seen.add(link);
      if (!ids.has(link) && !LINKABLE_ROUTES.includes(link)) {
        throw new Error(`${page.id}.md: links to "${link}", which is not a page id`);
      }
    }
  }
}

/**
 * Reverses every authored link, so a connection is written once and cannot be half-present.
 * Authored first in file order, backlinks after in page order — stable between runs.
 */
function addBacklinks(pages: Page[]): void {
  const byId = new Map(pages.map((p) => [p.id, p]));

  for (const page of pages) {
    // Snapshot: appending to another page's list must not feed back into this loop.
    for (const link of [...page.links]) {
      const target = byId.get(link);
      if (!target || target.links.includes(page.id)) continue;
      target.links.push(page.id);
    }
  }
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

  assertLinksResolve(pages);
  addBacklinks(pages);

  return pages;
}
