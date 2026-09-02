// The connect game is a route rather than a content page, so it has no entry in PAGES and
// nothing generated to describe it. This is that description, in one place: the grid card,
// the router and a `- connect` link on a topic page all read it from here.
export const GAME = {
  path: '/connect',
  id: 'connect',
  emoji: '🔗',
  title: 'Connect the words',
} as const;
