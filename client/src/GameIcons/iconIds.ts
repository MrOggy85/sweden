// The icon vocabulary, declared here rather than derived from GameIcons.tsx so that
// scripts/generate-game-content.ts can import it — that file is .tsx and pulls in React and
// a CSS module, neither of which a Deno script can load.
//
// Not a hand-kept second copy: GameIcons.tsx types its records as Record<ObjectIconId, …>,
// so an id here without a drawing (or a drawing without an id) fails `tsc --noEmit`.
// Order is display order at /dev/icons.

export const OBJECT_ICON_IDS = [
  'cow',
  'dog',
  'cat',
  'horse',
  'bird',
  'moose',
  'fox',
  'bear',
  'pig',
  'fish',
  'apple',
  'pineapple',
  'banana',
  'strawberry',
  'lemon',
  'pear',
  'blueberries',
  'carrot',
  'tomato',
  'cucumber',
  'potato',
  'corn',
  'car',
  'sun',
  'moon',
  'star',
  'cloud',
  'rain',
  'snow',
  'tree',
  'leaf',
  'flower',
  'stone',
  'gryta',
  'tallrik',
  'gaffel',
  'sked',
  'kniv',
  'spagetti',
  'falukorv',
  'blodpudding',
  'pizza',
  'sushi',
  'kanelbullar',
] as const;

export type ObjectIconId = typeof OBJECT_ICON_IDS[number];

export const GAME_COLOR_IDS = [
  'yellow',
  'pink',
  'orange',
  'green',
  'red',
  'blue',
  'purple',
] as const;

export type GameColorId = typeof GAME_COLOR_IDS[number];

export const COLOR_ICON_PREFIX = 'color-';
