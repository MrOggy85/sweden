// Runtime switches, set once at startup by the entry point (main.ts on Deno,
// cloudflare/src/index.ts on Workers). Shared code never reads Deno.env itself, so it
// bundles into a Worker, where there is no Deno global.

export type Config = {
  /** Local development: no Secure cookie (an iPad on http://<lan-ip>), /api/dev routes on. */
  dev: boolean;
};

let current: Config = { dev: false };

export function configure(next: Config): void {
  current = next;
}

export function config(): Config {
  return current;
}
