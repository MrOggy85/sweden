// Normalises whatever lands in client/static/media/sfx/ into the format the app serves:
// AAC in an .m4a container, same as the word clips, because that is what plays everywhere
// on an iPad without argument.
//
//   make convert-sfx                        # convert anything not already .m4a
//   make convert-sfx ARGS=--force           # redo files that already have an .m4a
//   make convert-sfx ARGS=--bitrate=96000   # denser material, ambience
//   make convert-sfx ARGS=--mono            # downmix
//
// macOS only, like generate-audio: afconvert is a system tool.
//
// 64 kbps by default, not the 24 kbps the speech clips use. A spoken word survives 24;
// an animal call or a chime has real spectral content and audibly falls apart. A
// two-second effect at 64 kbps is still ~16 KB.
//
// The source is deleted once its .m4a is written and checked, since the build copies
// static/ wholesale and a leftover download would ship next to its own output. Pass
// --keep to hold on to it; generate-content will then refuse to run until it is gone.

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

/** Deleting the only copy of a download on the strength of an exit code is not enough. */
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
