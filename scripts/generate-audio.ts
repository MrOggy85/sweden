// `## Words` in content/*.md and every pair list in content/games/ -> media/<slug>.m4a, via
// macOS `say` + `afconvert`. Run by hand; the clips are committed assets. See CLAUDE.md,
// "Adding a spoken word" — including installing the Swedish voice.

import { audioFileUrl, loadPages, MEDIA_DIR, slug, type Word } from './content.ts';
import { gamePairAudioUrl, loadAllGamePairs } from './gameContent.ts';
import { requireMacos, run } from './macos.ts';
import { stripFreeBoxes } from './mp4.ts';
import { assertOverridesUsed, loadPronunciations } from './pronounce.ts';
import { readAiff, speechDurationMs, trimCarrier, writeAiff } from './aiff.ts';

const VOICE = Deno.args.find((a) => a.startsWith('--voice='))?.slice('--voice='.length) ?? 'Alva';
const FORCE = Deno.args.includes('--force');

// Redo one clip: `ARGS=--only=banan`. Matches the derived filename, and implies --force.
const ONLY = Deno.args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const ONLY_SLUG = ONLY ? slug(ONLY) : null;

// The one place the encoder settings live. 24 kbps because 64/32/24/16 were
// indistinguishable on a one-word clip — measure with `make audio-variants` before changing.
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

/** How long the carrier lasts spoken alone — the prior for where to cut it off. */
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
  const spoken = overrides.get(word.sv) ?? word.sv;
  // An override ending in the word itself is a carrier, and gets cut back out of the audio.
  const carried = spoken !== word.sv && spoken.endsWith(` ${word.sv}`);

  await run('say', ['-v', VOICE, '-o', aiff.pathname, spoken]);
  try {
    if (carried) {
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

  // afconvert's ~3 KB of `free` padding outweighs any bitrate choice at this length.
  await Deno.writeFile(out, stripFreeBoxes(await Deno.readFile(out)));
}

await Deno.mkdir(MEDIA_DIR, { recursive: true });

const pages = await loadPages();
const gameLists = await loadAllGamePairs();
const overrides = await loadPronunciations();
assertOverridesUsed(overrides, [
  ...pages.flatMap((page) => page.words.map((word) => word.sv)),
  ...Object.values(gameLists).flat().map((pair) => pair.sv),
]);

let written = 0;
let skipped = 0;

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

for (const [file, pairs] of Object.entries(gameLists)) {
  for (const pair of pairs) await maybeGenerate(pair, gamePairAudioUrl(pair), `games/${file}`);
}

if (ONLY_SLUG !== null && written === 0) {
  throw new Error(`--only=${ONLY}: no word in content derives ${ONLY_SLUG}.m4a`);
}

console.log(`voice ${VOICE}: ${written} written, ${skipped} already present (--force to redo)`);
