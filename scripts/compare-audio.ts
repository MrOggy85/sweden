// One word at a range of AAC settings, so ENCODE_ARGS in generate-audio.ts can be set from
// measurements. macOS only. `make audio-variants WORD=tack ARGS=--play`.
//
// Sizes are broken down because a one-word clip is mostly not audio: halving the bitrate
// does not halve the file.

import { requireMacos, run } from './macos.ts';

const VOICE = Deno.args.find((a) => a.startsWith('--voice='))?.slice('--voice='.length) ?? 'Alva';
const PLAY = Deno.args.includes('--play');
const WORD = Deno.args.find((a) => !a.startsWith('--')) ?? 'hej';

// Scratch space. /tmp symlinks to /private/tmp on macOS, hence both in the Makefile.
const OUT_DIR = '/tmp/sweden-audio';

const VARIANTS = [
  { label: 'stereo 64k (current)', args: ['-d', 'aac', '-b', '64000'] },
  { label: 'mono 64k', args: ['-d', 'aac', '-c', '1', '-b', '64000'] },
  { label: 'mono 48k', args: ['-d', 'aac', '-c', '1', '-b', '48000'] },
  { label: 'mono 32k', args: ['-d', 'aac', '-c', '1', '-b', '32000'] },
  { label: 'mono 24k', args: ['-d', 'aac', '-c', '1', '-b', '24000'] },
  { label: 'mono 16k', args: ['-d', 'aac', '-c', '1', '-b', '16000'] },
];

// `mdat` is the audio; everything else is overhead.
async function measure(path: string): Promise<{ total: number; audio: number; free: number }> {
  const buf = await Deno.readFile(path);
  const dv = new DataView(buf.buffer);
  const decoder = new TextDecoder();
  let audio = 0;
  let free = 0;

  for (let off = 0; off + 8 <= buf.length;) {
    const size = dv.getUint32(off);
    if (size < 8) break;
    const type = decoder.decode(buf.subarray(off + 4, off + 8));
    if (type === 'mdat') audio = size - 8;
    if (type === 'free') free += size;
    off += size;
  }

  return { total: buf.length, audio, free };
}

requireMacos('compare-audio');

await Deno.mkdir(OUT_DIR, { recursive: true });
const aiff = `${OUT_DIR}/source.aiff`;
await run('say', ['-v', VOICE, '-o', aiff, WORD]);

console.log(`"${WORD}" in ${VOICE}:\n`);
console.log('  setting                 total     audio      free');

for (const variant of VARIANTS) {
  const out = `${OUT_DIR}/${variant.label.replace(/[^a-z0-9]+/gi, '-')}.m4a`;
  await run('afconvert', ['-f', 'm4af', ...variant.args, aiff, out]);
  const { total, audio, free } = await measure(out);
  console.log(
    `  ${variant.label.padEnd(22)}${String(total).padStart(6)} B${String(audio).padStart(8)} B${
      String(free).padStart(8)
    } B`,
  );
}

if (PLAY) {
  for (const variant of VARIANTS) {
    console.log(`playing ${variant.label}`);
    await run('afplay', [`${OUT_DIR}/${variant.label.replace(/[^a-z0-9]+/gi, '-')}.m4a`]);
  }
}

console.log(`\nfiles kept in ${OUT_DIR} — listen, then set ENCODE_ARGS in scripts/generate-audio.ts`);
