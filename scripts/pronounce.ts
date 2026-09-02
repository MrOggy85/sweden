// What `say` is given when that must differ from the displayed word — homographs, mostly.
// Keyed by the written word, so filenames and content are unaffected. Format and reasoning:
// content/audio/pronounce.md.

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

/** A stale override means the word was renamed, and it now silently applies to nothing. */
export function assertOverridesUsed(overrides: Map<string, string>, words: Iterable<string>): void {
  const known = new Set(words);
  const stale = [...overrides.keys()].filter((word) => !known.has(word));
  if (stale.length > 0) {
    throw new Error(`pronounce.md: no content uses ${stale.map((w) => `"${w}"`).join(', ')}`);
  }
}
