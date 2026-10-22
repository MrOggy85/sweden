// Shared by every page that chains word clips: PageView's scenes and SentenceBuilder.

// Back-to-back clips run together into one mumble.
export const GAP_MS = 120;

// ?v= puts the clip on the immutable cache branch in api/server.ts.
export const clipUrl = (audio: string) => `${audio}?v=${BUILD_HASH}`;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves when the clip finishes, or immediately if it refuses to play. */
export function playToEnd(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      audio.removeEventListener('ended', done);
      audio.removeEventListener('error', done);
      resolve();
    };
    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    // One bad clip must not strand the rest of the line.
    void audio.play().catch(done);
  });
}
