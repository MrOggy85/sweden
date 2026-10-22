import { useEffect, useRef } from 'react';
import { clipUrl, GAP_MS, playToEnd, sleep } from './clips';

/**
 * Plays clips one after another through one element — on iOS only the element a tap
 * unlocked may keep playing. A new `say` cuts off the last; so does unmount.
 * Resolves true when the whole run played, false when something cut it off.
 */
export function useSpeaker() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runRef = useRef(0);

  useEffect(() => () => {
    runRef.current++;
    audioRef.current?.pause();
  }, []);

  async function say(...sources: string[]): Promise<boolean> {
    const audio = audioRef.current ??= new Audio();
    const run = ++runRef.current;
    for (const [i, src] of sources.entries()) {
      if (run !== runRef.current) return false;
      audio.src = clipUrl(src);
      await playToEnd(audio);
      if (i < sources.length - 1) await sleep(GAP_MS);
    }
    return run === runRef.current;
  }

  return say;
}
