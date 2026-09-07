// UI feedback effects, declared in content/games/ui-sounds.md. Deliberately not vocabulary:
// see PROJECT.md's Sound section, and issue #9 for what is out of scope.

import { UI_SOUNDS } from '../data/gameContent';

export type SfxRole = 'tap' | 'correct' | 'fanfare';

// These sit under Alva's clips rather than over them.
const VOLUME = 0.4;

// One element, because on iOS only the element unlocked by a user gesture may play after.
// Its own first play is inside a tap handler, which is what unlocks it.
let element: HTMLAudioElement | null = null;

export function playSfx(role: SfxRole): void {
  const variants = UI_SOUNDS[role];
  const src = variants?.[Math.floor(Math.random() * variants.length)];
  if (!src) return;

  const audio = (element ??= new Audio());
  audio.volume = VOLUME;
  audio.src = `${src}?v=${BUILD_HASH}`;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}
