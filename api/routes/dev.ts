// Local-only intake for photos: writes into the working tree, edits the content file, and
// re-runs the content generator so an upload appears on the page. Registered only when
// DEV=1 (see server.ts); Deno Deploy has a read-only filesystem and could not run it.
//
// Nothing here touches KV, and nothing here ships.

const DEV_DIR = new URL('../../.dev/', import.meta.url);
const IMG_DIR = new URL('../../client/static/media/img/', import.meta.url);
const CONTENT_DIR = new URL('../../content/', import.meta.url);
const SOURCES = new URL('sources.json', IMG_DIR);
const REJECTED = new URL('media/rejected.md', CONTENT_DIR);
const GENERATOR = new URL('../../scripts/generate-content.ts', import.meta.url);

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

type Sources = Record<string, { source?: string; author?: string; licence?: string }>;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function readSources(): Promise<Sources> {
  try {
    return JSON.parse(await Deno.readTextFile(SOURCES)) as Sources;
  } catch {
    return {};
  }
}

async function writeSources(sources: Sources): Promise<void> {
  const ordered = Object.fromEntries(Object.entries(sources).sort(([a], [b]) => a.localeCompare(b)));
  await Deno.writeTextFile(SOURCES, `${JSON.stringify(ordered, null, 2)}\n`);
}

// PAGES only changes when the generator runs, so an upload is invisible until it does.
async function regenerate(): Promise<void> {
  await new Deno.Command(Deno.execPath(), {
    args: ['run', '-A', GENERATOR.pathname],
    stdout: 'inherit',
    stderr: 'inherit',
  }).output();
}

/** Free filename for a page: katt.jpg, then katt-2.jpg. */
async function nextName(page: string): Promise<string> {
  const taken = new Set<string>();
  for await (const entry of Deno.readDir(IMG_DIR)) taken.add(entry.name);
  if (!taken.has(`${page}.jpg`)) return `${page}.jpg`;
  for (let n = 2; n < 100; n++) {
    if (!taken.has(`${page}-${n}.jpg`)) return `${page}-${n}.jpg`;
  }
  throw new Error(`no free filename for ${page}`);
}

/** Appends to `## Images`, creating the section above Sounds/Video/Links if absent. */
function withImageLine(md: string, line: string): string {
  const heading = md.indexOf('\n## Images');
  if (heading !== -1) {
    const next = md.indexOf('\n## ', heading + 1);
    const at = next === -1 ? md.length : next;
    return `${md.slice(0, at).replace(/\s*$/, '')}\n${line}\n${md.slice(at).replace(/^\n/, '')}`;
  }

  const anchors = ['\n## Sounds', '\n## Video', '\n## Links']
    .map((a) => md.indexOf(a))
    .filter((i) => i !== -1);
  const at = anchors.length > 0 ? Math.min(...anchors) : md.length;
  return `${md.slice(0, at).replace(/\s*$/, '')}\n\n## Images\n\n${line}\n${
    at === md.length ? '' : `\n${md.slice(at).replace(/^\n+/, '')}`
  }`;
}

/** Removes the line naming a file, and the section with it if that was the last one. */
function withoutImageLine(md: string, file: string): string {
  const kept = md.split('\n').filter((line) => !(line.startsWith('- ') && line.includes(file)));
  return kept.join('\n')
    .replace(/\n## Images\n+(?=\n*## |\s*$)/, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

export async function postDevImage(req: Request): Promise<Response> {
  const form = await req.formData();
  const file = form.get('file');
  const page = String(form.get('page') ?? '');
  const caption = String(form.get('caption') ?? '').trim();

  if (!(file instanceof File)) return json({ error: 'no file' }, 400);
  if (file.size > MAX_IMAGE_BYTES) return json({ error: 'too large' }, 413);
  if (!ALLOWED.includes(file.type)) return json({ error: `unsupported type ${file.type}` }, 415);
  if (!page) return json({ error: 'no page' }, 400);
  if (!caption) return json({ error: 'a caption is required: it is also the alt text' }, 400);

  const md = new URL(`${page}.md`, CONTENT_DIR);
  try {
    await Deno.stat(md);
  } catch {
    return json({ error: `no content/${page}.md` }, 400);
  }

  await Deno.mkdir(IMG_DIR, { recursive: true });
  const name = await nextName(page);
  await Deno.writeFile(new URL(name, IMG_DIR), new Uint8Array(await file.arrayBuffer()));

  await Deno.writeTextFile(md, withImageLine(await Deno.readTextFile(md), `- ${caption} | ${name}`));

  const sources = await readSources();
  sources[name] = {
    source: String(form.get('source') ?? ''),
    author: String(form.get('author') ?? ''),
    licence: String(form.get('licence') ?? ''),
  };
  await writeSources(sources);

  await regenerate();
  return json({ ok: true, stored: name });
}

/**
 * Deletes a rejected image and unwires it, keeping only a line in content/media/rejected.md:
 * filename, reason and where it came from. That is what stops the same bad image being
 * picked again, and shows which kind of picture keeps failing.
 */
export async function postDevImageDrop(req: Request): Promise<Response> {
  const { file, page, reason } = await req.json() as { file?: string; page?: string; reason?: string };
  if (!file || !page) return json({ error: 'file and page are required' }, 400);
  if (file.includes('/')) return json({ error: 'bad filename' }, 400);

  const sources = await readSources();
  const source = sources[file]?.source ?? '';
  delete sources[file];
  await writeSources(sources);

  const md = new URL(`${page}.md`, CONTENT_DIR);
  try {
    await Deno.writeTextFile(md, withoutImageLine(await Deno.readTextFile(md), file));
  } catch {
    // A missing content file is not a reason to keep the image.
  }

  await Deno.remove(new URL(file, IMG_DIR)).catch(() => {});

  await Deno.mkdir(new URL('media/', CONTENT_DIR), { recursive: true });
  let log: string;
  try {
    log = await Deno.readTextFile(REJECTED);
  } catch {
    log = [
      'Images that were reviewed and rejected. Written by the /dev/images tool.',
      '',
      'Kept so the same picture is not picked twice, and so the reasons show which kind of',
      'image keeps failing. The files themselves are deleted.',
      '',
      '| file | page | reason | source |',
      '| --- | --- | --- | --- |',
      '',
    ].join('\n');
  }
  await Deno.writeTextFile(
    REJECTED,
    `${log.replace(/\s*$/, '')}\n| ${file} | ${page} | ${reason ?? '-'} | ${source || '-'} |\n`,
  );

  await regenerate();
  return json({ ok: true, dropped: file });
}

/** Verdicts from /dev/images, so a review does not have to be pasted by hand. */
export async function postDevReview(req: Request): Promise<Response> {
  const body = await req.text();
  if (body.length > 64 * 1024) return json({ error: 'too large' }, 413);

  await Deno.mkdir(DEV_DIR, { recursive: true });
  await Deno.writeTextFile(new URL('image-review.json', DEV_DIR), body);
  return json({ ok: true });
}
