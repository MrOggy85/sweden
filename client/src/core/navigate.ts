// Client-side routing, no library. The server already answers every extensionless path
// with index.html (see the PAGE SERVE fallback in api/server.ts), so a URL pushed here
// survives a refresh: the browser asks for /flag, gets the SPA back, and App reads the
// path on mount.
//
// The callback is registered once by App; anything else can call navigate() without being
// handed a prop through the tree.

type NavCallback = (path: string) => void;

let onNavigate: NavCallback | null = null;

export function registerNavigate(cb: NavCallback): void {
  onNavigate = cb;
}

/** Adds a history entry, so Back returns to where the child was. */
export function navigate(path: string): void {
  history.pushState(null, '', path);
  onNavigate?.(path);
}

/** Rewrites the current entry — for correcting a URL, not for moving between pages. */
export function navigateReplace(path: string): void {
  history.replaceState(null, '', path);
  onNavigate?.(path);
}
