// Generates the pronunciation clips referenced by `## Words` sections in content/*.md, and
// by content/games/connect-pairs.md, into client/static/media/<slug>.m4a, using macOS'
// built-in Swedish voice.
//
// Run by hand — `make generate-audio` — not from build/dev/check. The clips are committed
// editorial assets, unlike the generated TypeScript modules: Deno Deploy has no `say`, and
// a child should hear the same voice every time rather than whatever the build host had.
//
// macOS only. `say` writes AIFF, `afconvert` (also built in) compresses it to AAC in an
// .m4a container, which every target browser plays. Swapping this script for a cloud TTS
// API later changes nothing downstream — the app only ever fetches a static file.
//
// The Swedish voice must be installed first:
//   System Settings -> Accessibility -> Spoken Content -> System Voice -> Manage Voices...
// and then pick a Swedish one (Alva). `say -v '?'` lists what is installed.

import { audioFileUrl, loadPages, MEDIA_DIR, slug, type Word } from './content.ts';
import { gamePairAudioUrl, loadGamePairs } from './gameContent.ts';
import { requireMacos, run } from './macos.ts';
import { stripFreeBoxes } from './mp4.ts';

const VOICE = Deno.args.find((a) => a.startsWith('--voice='))?.slice('--voice='.length) ?? 'Alva';
const FORCE = Deno.args.includes('--force');

// The one place the encoder settings live. `make audio-variants` encodes a single word at
// a range of settings and prints the resulting sizes, so this line can be changed against
// measurements rather than guesses.
//
// 24 kbps: `say` hands us mono 22.05 kHz, and 64/32/24/16 kbps were indistinguishable on a
// one-word clip. 24 sits one step above the floor, which leaves margin for longer phrases
// where artifacts accumulate. Dropping to 16 saves a further ~600 B per clip.
const ENCODE_ARGS = ['-d', 'aac', '-b', '24000'];

requireMacos('generate-audio');

async function exists(url: URL): Promise<boolean> {
  try {
    await Deno.stat(url);
    return true;
  } catch {
    return false;
  }
}

async function generate(word: Pick<Word, 'sv'>, out: URL): Promise<void> {
  const aiff = new URL(`${slug(word.sv)}.aiff`, MEDIA_DIR);

  await run('say', ['-v', VOICE, '-o', aiff.pathname, word.sv]);
  try {
    await run('afconvert', ['-f', 'm4af', ...ENCODE_ARGS, aiff.pathname, out.pathname]);
  } finally {
    await Deno.remove(aiff);
  }

  // afconvert pads every file with ~3 KB of `free`, which outweighs any bitrate choice on
  // clips this short.
  await Deno.writeFile(out, stripFreeBoxes(await Deno.readFile(out)));
}

await Deno.mkdir(MEDIA_DIR, { recursive: true });

const pages = await loadPages();
const gamePairs = await loadGamePairs();
let written = 0;
let skipped = 0;

for (const page of pages) {
  for (const word of page.words) {
    const out = audioFileUrl(word);
    if (!FORCE && await exists(out)) {
      skipped++;
      continue;
    }
    await generate(word, out);
    written++;
    console.log(`${page.id}: "${word.sv}" -> ${out.pathname}`);
  }
}

for (const pair of gamePairs) {
  const out = gamePairAudioUrl(pair);
  if (!FORCE && await exists(out)) {
    skipped++;
    continue;
  }
  await generate(pair, out);
  written++;
  console.log(`games/connect-pairs: "${pair.sv}" -> ${out.pathname}`);
}

console.log(`voice ${VOICE}: ${written} written, ${skipped} already present (--force to redo)`);
