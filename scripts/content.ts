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
};

export type Page = {
  id: string;
  order: number;
  title: string;
  emoji: string;
  blurb: string;
  facts: string[];
  words: Word[];
};

export const CONTENT_DIR = new URL('../content/', import.meta.url);
export const MEDIA_DIR = new URL('../client/static/media/', import.meta.url);

// Where the browser asks for a clip. client/static/media/ is copied to api/client/media/
// by the build, and api/server.ts serves anything ending in .m4a from there.
const AUDIO_URL_PREFIX = '/media/';

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
  const [sv, en, ...rest] = item.split('|').map((part) => part.trim());
  if (!sv || !en || rest.length > 0) {
    throw new Error(`${filename}: word "${item}" must be written as "swedish | english"`);
  }
  if (!slug(sv)) throw new Error(`${filename}: word "${sv}" has no letters to build a filename from`);
  return { sv, en, audio: `${AUDIO_URL_PREFIX}${slug(sv)}.m4a` };
}

// Bullets before the first `##` heading are facts; bullets under `## Words` are
// vocabulary. Bullets under any other heading are ignored, so prose sections can be added
// to a topic without turning into facts.
function parseBody(body: string, filename: string): { facts: string[]; words: Word[] } {
  const facts: string[] = [];
  const words: Word[] = [];
  let section: 'facts' | 'words' | 'other' = 'facts';

  for (const line of body.split('\n')) {
    const heading = line.match(/^##\s+(.*?)\s*$/);
    if (heading) {
      section = heading[1].toLowerCase() === 'words' ? 'words' : 'other';
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;
    const item = trimmed.slice(2).trim();

    if (section === 'facts') facts.push(item);
    else if (section === 'words') words.push(parseWord(item, filename));
  }

  return { facts, words };
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

  const orderRaw = requireField(fields, 'order', entryName);
  const order = Number(orderRaw);
  if (!Number.isFinite(order)) throw new Error(`${entryName}: order "${orderRaw}" is not a number`);

  const title = requireField(fields, 'title', entryName);
  const emoji = requireField(fields, 'emoji', entryName);
  const blurb = requireField(fields, 'blurb', entryName);

  const { facts, words } = parseBody(body, entryName);
  if (facts.length === 0) throw new Error(`${entryName}: no facts found — expected a Markdown bullet list ("- ...")`);

  return { id, order, title, emoji, blurb, facts, words };
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
