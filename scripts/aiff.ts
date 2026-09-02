// Just enough AIFF to cut a carrier word off what `say` writes, on 16-bit PCM before
// afconvert sees it. Why a carrier at all: content/audio/pronounce.md.

type Chunk = { id: string; start: number; size: number };

const decoder = new TextDecoder();

function chunks(buf: Uint8Array): Chunk[] {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const found: Chunk[] = [];
  // FORM header: 'FORM' + size + 'AIFF', then chunks.
  for (let off = 12; off + 8 <= buf.length;) {
    const id = decoder.decode(buf.subarray(off, off + 4));
    const size = dv.getUint32(off + 4);
    found.push({ id, start: off, size });
    off += 8 + size + (size % 2); // chunks are padded to an even length
  }
  return found;
}

/** The 80-bit IEEE extended float AIFF stores its sample rate in. */
function readExtended(dv: DataView, at: number): number {
  const exponent = dv.getUint16(at) & 0x7fff;
  const hi = dv.getUint32(at + 2);
  const lo = dv.getUint32(at + 6);
  return (hi * 2 ** 32 + lo) * 2 ** (exponent - 16383 - 63);
}

export type Aiff = {
  sampleRate: number;
  channels: number;
  frames: number;
  /** Big-endian 16-bit samples, interleaved. */
  samples: Int16Array;
};

export function readAiff(buf: Uint8Array): Aiff {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const comm = chunks(buf).find((c) => c.id === 'COMM');
  const ssnd = chunks(buf).find((c) => c.id === 'SSND');
  if (!comm || !ssnd) throw new Error('aiff: expected both COMM and SSND chunks');

  const channels = dv.getUint16(comm.start + 8);
  const frames = dv.getUint32(comm.start + 10);
  const bits = dv.getUint16(comm.start + 14);
  const sampleRate = readExtended(dv, comm.start + 16);
  if (bits !== 16) throw new Error(`aiff: expected 16-bit samples, got ${bits}`);

  // SSND data starts after its offset and blockSize fields.
  const dataStart = ssnd.start + 8 + 8 + dv.getUint32(ssnd.start + 8);
  const samples = new Int16Array(frames * channels);
  for (let i = 0; i < samples.length; i++) samples[i] = dv.getInt16(dataStart + i * 2);

  return { sampleRate, channels, frames, samples };
}

export function writeAiff(aiff: Aiff): Uint8Array {
  const dataBytes = aiff.samples.length * 2;
  const commSize = 18;
  const ssndSize = 8 + dataBytes;
  const total = 4 + (8 + commSize) + (8 + ssndSize);

  const out = new Uint8Array(8 + total);
  const dv = new DataView(out.buffer);
  const ascii = (text: string, at: number) => {
    for (let i = 0; i < text.length; i++) out[at + i] = text.charCodeAt(i);
  };

  ascii('FORM', 0);
  dv.setUint32(4, total);
  ascii('AIFF', 8);

  ascii('COMM', 12);
  dv.setUint32(16, commSize);
  dv.setUint16(20, aiff.channels);
  dv.setUint32(22, aiff.frames);
  dv.setUint16(26, 16);
  // Sample rate as 80-bit extended: exponent then a normalised 64-bit mantissa.
  const exponent = Math.floor(Math.log2(aiff.sampleRate));
  dv.setUint16(28, 16383 + exponent);
  const mantissa = aiff.sampleRate / 2 ** exponent * 2 ** 63;
  dv.setUint32(30, Math.floor(mantissa / 2 ** 32));
  dv.setUint32(34, mantissa >>> 0);

  ascii('SSND', 38);
  dv.setUint32(42, ssndSize);
  dv.setUint32(46, 0); // offset
  dv.setUint32(50, 0); // blockSize
  for (let i = 0; i < aiff.samples.length; i++) dv.setInt16(54 + i * 2, aiff.samples[i]!);

  return out;
}

const FRAME_MS = 5;
// Keep the stop closure before the b: cutting at the burst clips the consonant.
const PREROLL_MS = 35;
// Asymmetric: in context a word is shorter than spoken alone.
const SEARCH_BACK_MS = 140;
const SEARCH_FORWARD_MS = 90;
// Sanity bounds — either extreme means the boundary was not where expected.
const MIN_KEPT_MS = 120;
const MIN_CUT_MS = 60;

function loudnessFrames(aiff: Aiff): { loudness: number[]; frameSize: number } {
  const frameSize = Math.max(1, Math.round(aiff.sampleRate * FRAME_MS / 1000)) * aiff.channels;
  const loudness: number[] = [];
  for (let i = 0; i < aiff.samples.length; i += frameSize) {
    let peak = 0;
    for (let j = i; j < Math.min(i + frameSize, aiff.samples.length); j++) {
      peak = Math.max(peak, Math.abs(aiff.samples[j]!));
    }
    loudness.push(peak);
  }
  return { loudness, frameSize };
}

/** Milliseconds of audio, ignoring leading and trailing near-silence. */
export function speechDurationMs(aiff: Aiff): number {
  const { loudness } = loudnessFrames(aiff);
  const threshold = Math.max(...loudness) * 0.06;
  const first = loudness.findIndex((v) => v > threshold);
  const last = loudness.reduce((acc, v, i) => (v > threshold ? i : acc), -1);
  if (first === -1 || last <= first) return 0;
  return (last - first + 1) * FRAME_MS;
}

/**
 * Cuts a carrier word off the front, given how long that carrier takes to say alone.
 *
 * Searches for the energy minimum near that point, not for silence: two words run together
 * leave none, only a dip at the next word's stop closure. Null when the result would be
 * implausible, so a bad cut fails rather than shipping half a word.
 */
export function trimCarrier(aiff: Aiff, carrierMs: number): { trimmed: Aiff; cutMs: number } | null {
  const { loudness, frameSize } = loudnessFrames(aiff);
  const totalMs = loudness.length * FRAME_MS;

  const from = Math.max(1, Math.round((carrierMs - SEARCH_BACK_MS) / FRAME_MS));
  const to = Math.min(loudness.length - 1, Math.round((carrierMs + SEARCH_FORWARD_MS) / FRAME_MS));
  if (to <= from) return null;

  let quietest = from;
  for (let i = from; i <= to; i++) {
    if (loudness[i]! < loudness[quietest]!) quietest = i;
  }

  const startFrame = Math.max(0, quietest - Math.round(PREROLL_MS / FRAME_MS));
  const cutMs = startFrame * FRAME_MS;
  if (cutMs < MIN_CUT_MS || totalMs - cutMs < MIN_KEPT_MS) return null;

  const trimmed = aiff.samples.slice(startFrame * frameSize);
  return { trimmed: { ...aiff, samples: trimmed, frames: trimmed.length / aiff.channels }, cutMs };
}
