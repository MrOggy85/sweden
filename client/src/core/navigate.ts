// Routing without a library. Works on refresh because api/server.ts answers every
// extensionless path with index.html. The callback is registered once by App, so anything
// can navigate without a prop threaded through the tree.

type NavCallback = (path: string) => void;

let onNavigate: NavCallback | null = null;

export function registerNavigate(cb: NavCallback): void {
  onNavigate = cb;
}

/** Adds a history entry, so Back returns where the child was. */
export function navigate(path: string): void {
  history.pushState(null, '', path);
  onNavigate?.(path);
}

/** Rewrites the current entry — corrects a URL, does not move between pages. */
export function navigateReplace(path: string): void {
  history.replaceState(null, '', path);
  onNavigate?.(path);
}
