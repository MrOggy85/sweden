// The id lists here are hand-duplicated from api/db/content.ts — edit both together.
// GET /api/health reports the server's PAGE_IDS count so a mismatch is visible in dev.
//
// The page copy (title/emoji/facts) is client-only: the server stores ids, not content.

export const ANIMAL_IDS = [
  'moose',
  'fox',
  'lynx',
  'reindeer',
  'puffin',
  'hedgehog',
  'troll',
  'dala-horse',
] as const;

export const COLOR_IDS = [
  'blue',
  'yellow',
  'red',
  'green',
  'purple',
  'teal',
  'orange',
  'pink',
] as const;

export const VISIT_KINDS = ['view', 'quiz'] as const;

export type AnimalId = typeof ANIMAL_IDS[number];
export type ColorId = typeof COLOR_IDS[number];
export type VisitKind = typeof VISIT_KINDS[number];

// The server narrows this to a literal union via its own PAGE_IDS allowlist. On the
// client the ids come from the PAGES content array below, so it stays a string; an id the
// server does not know gets a 400 from POST /api/visits.
export type PageId = string;

export const COLORS: Record<ColorId, string> = {
  blue: '#005293',
  yellow: '#fecc00',
  red: '#d1495b',
  green: '#2a9d8f',
  purple: '#7b5ea7',
  teal: '#2d8f9e',
  orange: '#ef8354',
  pink: '#e07a9c',
};

export const ANIMAL_LABELS: Record<AnimalId, string> = {
  'moose': 'Moose',
  'fox': 'Fox',
  'lynx': 'Lynx',
  'reindeer': 'Reindeer',
  'puffin': 'Puffin',
  'hedgehog': 'Hedgehog',
  'troll': 'Troll',
  'dala-horse': 'Dala horse',
};

export type Page = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  facts: string[];
};

export const PAGES: Page[] = [
  {
    id: 'flag',
    title: 'The Flag',
    emoji: '🇸🇪',
    blurb: 'Blue with a yellow cross.',
    facts: [
      'The yellow cross is called a Nordic cross. Denmark, Norway, Finland and Iceland have one too.',
      'The blue stands for the lakes and the sky, the yellow for fields of grain.',
      'Sweden has over 260 000 lakes, so there is a lot of blue to stand for.',
    ],
  },
  {
    id: 'map',
    title: 'Where Is It?',
    emoji: '🗺️',
    blurb: 'Long and thin, up in the north.',
    facts: [
      'Sweden is in northern Europe, between Norway and Finland.',
      'It is so long that driving from the bottom to the top takes about 20 hours.',
      'The very north sits inside the Arctic Circle.',
    ],
  },
  {
    id: 'stockholm',
    title: 'Stockholm',
    emoji: '🏰',
    blurb: 'The capital, built on 14 islands.',
    facts: [
      'Stockholm is spread across 14 islands joined by 57 bridges.',
      'The old town, Gamla Stan, has streets from the 1300s.',
      'One alley there is only 90 centimetres wide — narrower than a door.',
    ],
  },
  {
    id: 'fika',
    title: 'Fika',
    emoji: '🍰',
    blurb: 'A coffee break, but important.',
    facts: [
      'Fika means stopping for something to drink and something sweet, with people.',
      'The classic fika bun is the kanelbulle, a cinnamon bun.',
      'Cinnamon Bun Day is 4 October. It is a real day.',
    ],
  },
  {
    id: 'midsummer',
    title: 'Midsummer',
    emoji: '🌸',
    blurb: 'The longest day of the year.',
    facts: [
      'People raise a flower-covered pole and dance around it.',
      'In the far north the sun does not set at all — this is the midnight sun.',
      'One of the dances is about small frogs. Everyone hops.',
    ],
  },
  {
    id: 'animals',
    title: 'Animals',
    emoji: '🦌',
    blurb: 'Moose, lynx, and a lot of forest.',
    facts: [
      'Around 300 000 moose live in Sweden. They are the biggest deer in the world.',
      'Almost 70% of Sweden is covered in forest.',
      'Reindeer are herded in the north by the Sami people.',
    ],
  },
  {
    id: 'language',
    title: 'Swedish Words',
    emoji: '💬',
    blurb: 'A few to try out loud.',
    facts: [
      'Hej means hello. It sounds like "hey".',
      'Tack means thank you.',
      'The alphabet has three extra letters at the end: å, ä and ö.',
    ],
  },
  {
    id: 'winter',
    title: 'Winter',
    emoji: '❄️',
    blurb: 'Dark, snowy, and full of candles.',
    facts: [
      'In the far north the sun stays below the horizon for weeks. This is called polar night.',
      'The northern lights turn the sky green and purple.',
      'There is a hotel in Jukkasjärvi built out of ice, rebuilt every single year.',
    ],
  },
];

export const PAGE_IDS = PAGES.map((p) => p.id);

export function pageById(id: string): Page | undefined {
  return PAGES.find((p) => p.id === id);
}
