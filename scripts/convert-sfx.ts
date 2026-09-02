// Whatever lands in media/sfx/ -> AAC in .m4a, like the word clips. macOS only.
//
//   make convert-sfx ARGS=--force / --bitrate=96000 / --mono / --keep
//
// 64 kbps, not the speech clips' 24: a word survives 24, an animal call does not. The
// source is deleted once the output is checked, or it would ship beside its own output.
// See CLAUDE.md, "Adding a sound effect".

import { SFX_DIR, SFX_SOURCE_EXTENSIONS } from './content.ts';
import { requireMacos, run } from './macos.ts';
import { stripFreeBoxes } from './mp4.ts';

const BITRATE = Deno.args.find((a) => a.startsWith('--bitrate='))?.slice('--bitrate='.length) ?? '64000';
const FORCE = Deno.args.includes('--force');
const MONO = Deno.args.includes('--mono');
const KEEP = Deno.args.includes('--keep');

async function exists(url: URL): Promise<boolean> {
  try {
    await Deno.stat(url);
    return true;
  } catch {
    return false;
  }
}

/** An exit code is not enough to delete the only copy of a download. */
async function assertPlayable(out: URL): Promise<void> {
  const buf = await Deno.readFile(out);
  const brand = new TextDecoder().decode(buf.subarray(4, 8));
  if (brand !== 'ftyp') throw new Error(`${out.pathname}: not an MP4 container — refusing to delete the source`);
  if (buf.length < 1024) throw new Error(`${out.pathname}: suspiciously small — refusing to delete the source`);
}

requireMacos('convert-sfx');

if (!await exists(SFX_DIR)) {
  console.log(`no ${SFX_DIR.pathname} — nothing to convert`);
  Deno.exit(0);
}

let converted = 0;
let skipped = 0;

for await (const entry of Deno.readDir(SFX_DIR)) {
  if (!entry.isFile) continue;

  const dot = entry.name.lastIndexOf('.');
  const stem = dot === -1 ? entry.name : entry.name.slice(0, dot);
  const extension = dot === -1 ? '' : entry.name.slice(dot).toLowerCase();
  if (!SFX_SOURCE_EXTENSIONS.includes(extension)) continue;

  const source = new URL(entry.name, SFX_DIR);
  const out = new URL(`${stem}.m4a`, SFX_DIR);

  if (!FORCE && await exists(out)) {
    skipped++;
    continue;
  }

  const args = ['-f', 'm4af', '-d', 'aac', '-b', BITRATE];
  if (MONO) args.push('-c', '1');
  await run('afconvert', [...args, source.pathname, out.pathname]);

  // afconvert reserves ~3 KB of `free` padding in every file it writes.
  await Deno.writeFile(out, stripFreeBoxes(await Deno.readFile(out)));

  await assertPlayable(out);

  const before = (await Deno.stat(source)).size;
  const after = (await Deno.stat(out)).size;
  if (!KEEP) await Deno.remove(source);
  console.log(`${entry.name} -> ${stem}.m4a  ${before} -> ${after} B${KEEP ? '  (source kept)' : ''}`);
  converted++;
}

console.log(`${BITRATE.slice(0, -3)} kbps${MONO ? ' mono' : ''}: ${converted} converted, ${skipped} already done`);
if (KEEP && converted > 0) console.log('Sources kept — generate-content will refuse to run until they are gone.');
