// Strips `free` boxes from an .m4a.
//
// afconvert reserves ~3 KB of padding in every file it writes. That is a third of a
// one-word clip at 64 kbps and over half of one at 16 kbps, and no encoder setting affects
// it — it is reserved space, not audio.
//
// Removing a `free` box that sits before `mdat` moves the audio earlier in the file, so
// every absolute chunk offset in `stco` has to be corrected by the number of removed bytes
// that preceded it. Getting that wrong produces a file that still parses but plays
// silence or noise, so `assertChunkOffsets` re-checks the result against `mdat`.

type Box = { type: string; start: number; size: number };

const decoder = new TextDecoder();

function readBoxes(buf: Uint8Array, start: number, end: number): Box[] {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const boxes: Box[] = [];
  for (let off = start; off + 8 <= end;) {
    const size = dv.getUint32(off);
    if (size < 8) break;
    boxes.push({ type: decoder.decode(buf.subarray(off + 4, off + 8)), start: off, size });
    off += size;
  }
  return boxes;
}

// stco lives at moov/trak/mdia/minf/stbl/stco. Only these containers need descending into.
const CONTAINERS = ['moov', 'trak', 'mdia', 'minf', 'stbl'];

function findBoxes(buf: Uint8Array, start: number, end: number, type: string): Box[] {
  const found: Box[] = [];
  for (const box of readBoxes(buf, start, end)) {
    if (box.type === type) found.push(box);
    else if (CONTAINERS.includes(box.type)) {
      found.push(...findBoxes(buf, box.start + 8, box.start + box.size, type));
    }
  }
  return found;
}

/**
 * Returns the input unchanged when there is nothing to strip, or when the file uses 64-bit
 * chunk offsets (`co64`) — that only shows up on files far larger than a spoken word, and
 * silently mis-patching one is worse than leaving 3 KB on the table.
 */
export function stripFreeBoxes(input: Uint8Array): Uint8Array {
  const top = readBoxes(input, 0, input.length);
  const free = top.filter((b) => b.type === 'free');
  if (free.length === 0) return input;

  const moov = top.find((b) => b.type === 'moov');
  if (!moov) return input;
  if (findBoxes(input, moov.start + 8, moov.start + moov.size, 'co64').length > 0) return input;

  // How many removed bytes precede a given offset in the original file.
  const removedBefore = (offset: number) => free.reduce((sum, box) => (box.start < offset ? sum + box.size : sum), 0);

  const kept = top.filter((b) => b.type !== 'free');
  const output = new Uint8Array(kept.reduce((sum, b) => sum + b.size, 0));
  let cursor = 0;
  let newMoovStart = 0;
  for (const box of kept) {
    if (box.type === 'moov') newMoovStart = cursor;
    output.set(input.subarray(box.start, box.start + box.size), cursor);
    cursor += box.size;
  }

  const dv = new DataView(output.buffer);
  for (const stco of findBoxes(output, newMoovStart + 8, newMoovStart + moov.size, 'stco')) {
    // stco: 4 version+flags, 4 entry_count, then entry_count 32-bit offsets.
    const entries = dv.getUint32(stco.start + 12);
    for (let i = 0; i < entries; i++) {
      const at = stco.start + 16 + i * 4;
      const original = dv.getUint32(at);
      dv.setUint32(at, original - removedBefore(original));
    }
  }

  assertChunkOffsets(output);
  return output;
}

/** Every chunk offset must land inside `mdat`'s payload, or the clip is broken. */
function assertChunkOffsets(buf: Uint8Array): void {
  const top = readBoxes(buf, 0, buf.length);
  const mdat = top.find((b) => b.type === 'mdat');
  const moov = top.find((b) => b.type === 'moov');
  if (!mdat || !moov) throw new Error('mp4: expected both moov and mdat after stripping');

  const dv = new DataView(buf.buffer);
  for (const stco of findBoxes(buf, moov.start + 8, moov.start + moov.size, 'stco')) {
    const entries = dv.getUint32(stco.start + 12);
    for (let i = 0; i < entries; i++) {
      const offset = dv.getUint32(stco.start + 16 + i * 4);
      if (offset < mdat.start + 8 || offset >= mdat.start + mdat.size) {
        throw new Error(`mp4: chunk offset ${offset} falls outside mdat after stripping`);
      }
    }
  }
}
