// The game is a route, not a content page, so nothing generates a description for it.
// This is it — read by the grid card, the router, and `- connect` links.
export const GAME = {
  path: '/connect',
  id: 'connect',
  emoji: '🔗',
  title: 'Connect the words',
} as const;
