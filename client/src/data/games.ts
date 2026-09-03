// Games are routes, not content pages, so nothing generates a description for them. This
// is it: read by the grid cards, the router, and `- connect` / `- cooking` page links.
export type Game = {
  path: string;
  id: string;
  emoji: string;
  title: string;
};

export const GAMES: Game[] = [
  { path: '/connect', id: 'connect', emoji: '🔗', title: 'Connect the words' },
  { path: '/cooking', id: 'cooking', emoji: '🍲', title: 'Laga mat' },
];

export function gameById(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}

export function gameByPath(path: string): Game | undefined {
  return GAMES.find((g) => g.path === path);
}
