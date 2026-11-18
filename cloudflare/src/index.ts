import { handleApi } from '../../api/app.ts';
import { configure } from '../../api/config.ts';
import { useStore } from '../../api/db/store.ts';
import logger from '../../api/logger.ts';
import { d1Store, prune } from './d1store.ts';

/**
 * The Cloudflare Worker: the Deno server's /api handler (`api/app.ts`) with D1 for
 * storage. Static files never reach this code: `run_worker_first` is only `/api/*`, and
 * Workers static assets answers everything else, with index.html for unknown paths
 * (single-page-application), as the Deno server did.
 */
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Rate Limiting binding: /api requests per client address. */
  REQUESTS: RateLimit;
}

let ready = false;

/** Plugs D1 into the shared code, once per isolate. Bindings do not change between requests. */
function setup(env: Env) {
  if (ready) return;
  configure({ dev: false });
  useStore(d1Store(env.DB));
  ready = true;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    setup(env);
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api')) return env.ASSETS.fetch(req);

    // Set by the edge; the client cannot forge it, unlike x-forwarded-for.
    const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';
    const { success } = await env.REQUESTS.limit({ key: ip });
    if (!success) return new Response('Too Many Requests', { status: 429, headers: { 'retry-after': '60' } });

    return handleApi(req, ip);
  },

  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    const removed = await prune(env.DB);
    logger.info('prune', removed);
  },
} satisfies ExportedHandler<Env>;
