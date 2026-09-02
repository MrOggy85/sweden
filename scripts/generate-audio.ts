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
import { assertOverridesUsed, loadPronunciations } from './pronounce.ts';
import { readAiff, speechDurationMs, trimCarrier, writeAiff } from './aiff.ts';

const VOICE = Deno.args.find((a) => a.startsWith('--voice='))?.slice('--voice='.length) ?? 'Alva';
const FORCE = Deno.args.includes('--force');

// Redo one word without re-encoding the other seventy: `ARGS=--only=banan`. Matches on the
// derived filename, so either the word or its slug works, and it implies --force — asking
// to regenerate one clip and being told it already exists would be absurd.
const ONLY = Deno.args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const ONLY_SLUG = ONLY ? slug(ONLY) : null;

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

/** Speaks the carrier on its own and reports how long it lasts, in milliseconds. */
async function measureCarrier(carrier: string): Promise<number> {
  const probe = new URL('carrier-probe.aiff', MEDIA_DIR);
  await run('say', ['-v', VOICE, '-o', probe.pathname, carrier]);
  try {
    return speechDurationMs(readAiff(await Deno.readFile(probe)));
  } finally {
    await Deno.remove(probe);
  }
}

async function generate(word: Pick<Word, 'sv'>, out: URL): Promise<void> {
  const aiff = new URL(`${slug(word.sv)}.aiff`, MEDIA_DIR);
  // The filename still comes from the written word; only the spoken text can differ.
  const spoken = overrides.get(word.sv) ?? word.sv;
  // An override ending in the word itself is a carrier: extra words in front that fix the
  // stress, spoken contiguously because a pause loses it again, then cut from the audio.
  const carried = spoken !== word.sv && spoken.endsWith(` ${word.sv}`);

  await run('say', ['-v', VOICE, '-o', aiff.pathname, spoken]);
  try {
    if (carried) {
      // How long the carrier takes on its own, as the prior for where the boundary is.
      // Two words run together leave no silence to search for, only a dip.
      const carrierMs = await measureCarrier(spoken.slice(0, -(word.sv.length + 1)));
      const parsed = readAiff(await Deno.readFile(aiff));
      const cut = trimCarrier(parsed, carrierMs);
      if (!cut) {
        throw new Error(
          `"${word.sv}" is said as "${spoken}", but the carrier boundary was not where a ` +
            `${Math.round(carrierMs)}ms carrier put it. Try a different carrier word, or drop the override.`,
        );
      }
      await Deno.writeFile(aiff, writeAiff(cut.trimmed));
      console.log(`  cut ${cut.cutMs}ms of carrier from "${word.sv}"`);
    }
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
const overrides = await loadPronunciations();
assertOverridesUsed(overrides, [
  ...pages.flatMap((page) => page.words.map((word) => word.sv)),
  ...gamePairs.map((pair) => pair.sv),
]);

let written = 0;
let skipped = 0;

/** Whether this word is being asked for, and whether an existing clip should be replaced. */
function wanted(sv: string): boolean {
  return ONLY_SLUG === null || slug(sv) === ONLY_SLUG;
}

async function maybeGenerate(word: Pick<Word, 'sv'>, out: URL, source: string): Promise<void> {
  if (!wanted(word.sv)) return;
  if (!FORCE && ONLY_SLUG === null && await exists(out)) {
    skipped++;
    return;
  }
  await generate(word, out);
  written++;
  const spoken = overrides.get(word.sv);
  const via = spoken ? ` (said as "${spoken}"${spoken.endsWith(` ${word.sv}`) ? ', carrier trimmed' : ''})` : '';
  console.log(`${source}: "${word.sv}"${via} -> ${out.pathname}`);
}

for (const page of pages) {
  for (const word of page.words) await maybeGenerate(word, audioFileUrl(word), page.id);
}

for (const pair of gamePairs) {
  await maybeGenerate(pair, gamePairAudioUrl(pair), 'games/connect-pairs');
}

if (ONLY_SLUG !== null && written === 0) {
  throw new Error(`--only=${ONLY}: no word in content derives ${ONLY_SLUG}.m4a`);
}

console.log(`voice ${VOICE}: ${written} written, ${skipped} already present (--force to redo)`);
