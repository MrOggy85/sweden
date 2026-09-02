// Pronunciation overrides: what `say` is given, when that has to differ from what the app
// displays.
//
// The spoken text is normally the Swedish word itself, which is right until the word is a
// homograph. "banan" is both the fruit (ba-NAN) and "the track" (BA-nan), and Alva reads it
// as the track — nothing in the pipeline can know which was meant, because it only ever
// sees the spelling.
//
// Keyed by the word as written in content, so the display text, the filename and the link
// between them are all unchanged; only the string handed to the synthesiser differs.

export const PRONOUNCE_FILE = new URL('../content/audio/pronounce.md', import.meta.url);

/** Word as written in content -> text to hand `say`. */
export async function loadPronunciations(): Promise<Map<string, string>> {
  let raw: string;
  try {
    raw = await Deno.readTextFile(PRONOUNCE_FILE);
  } catch {
    return new Map(); // the file is optional
  }

  const overrides = new Map<string, string>();

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) continue;

    const [word, say, ...rest] = trimmed.slice(2).split('|').map((part) => part.trim());
    if (!word || !say || rest.length > 0) {
      throw new Error(`pronounce.md: "${trimmed}" must be written as "word | what to say"`);
    }
    if (overrides.has(word)) throw new Error(`pronounce.md: "${word}" appears twice`);
    overrides.set(word, say);
  }

  return overrides;
}

/**
 * An override for a word nobody uses any more is worse than none: the word it was written
 * for has been renamed or removed, so the next regeneration silently produces the wrong
 * sound for whatever replaced it.
 */
export function assertOverridesUsed(overrides: Map<string, string>, words: Iterable<string>): void {
  const known = new Set(words);
  const stale = [...overrides.keys()].filter((word) => !known.has(word));
  if (stale.length > 0) {
    throw new Error(`pronounce.md: no content uses ${stale.map((w) => `"${w}"`).join(', ')}`);
  }
}
