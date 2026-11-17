import { serveFile } from 'jsr:@std/http/file-server';
import { fromFileUrl } from 'jsr:@std/path';
import logger, { getClientIp } from './logger.ts';
import { handleApi } from './app.ts';
import { config } from './config.ts';
import { postDevImage, postDevImageDrop, postDevReview } from './routes/dev.ts';

// Anything not listed here falls through to the SPA and is answered with index.html and a
// 200 — a missing audio extension looks like a working request that plays nothing.
const RESOURCE_FILE_ENDING = [
  '.ico',
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.map',
  '.webmanifest',
  '.m4a',
  '.mp3',
];

// Resolved from this module's own location rather than Deno.cwd(). On Deno Deploy cwd is
// the root of the uploaded tree, which is not necessarily api/ — resolving relative to
// server.ts finds api/client/ identically from any cwd.
const root = Deno.env.get('CLIENT_ROOT') ?? fromFileUrl(new URL('./client', import.meta.url));

const STATIC_IMMUTABLE = 'public, max-age=31536000, immutable';
const STATIC_REVALIDATE = 'public, max-age=86400, must-revalidate';
const HTML_NO_CACHE = 'no-cache, must-revalidate';

function withCache(resp: Response, cacheControl: string) {
  const headers = new Headers(resp.headers);
  headers.set('cache-control', cacheControl);
  return new Response(resp.body, { status: resp.status, headers });
}

// The /api/dev routes write to the working tree, so they exist only locally (DEV=1).
async function devRoutes(req: Request, url: URL): Promise<Response | null> {
  if (url.pathname === '/api/dev/review' && req.method === 'POST') return await postDevReview(req);
  if (url.pathname === '/api/dev/image' && req.method === 'POST') return await postDevImage(req);
  if (url.pathname === '/api/dev/image/drop' && req.method === 'POST') return await postDevImageDrop(req);
  return null;
}

export function init(host: string, port: string) {
  return Deno.serve({ hostname: host, port: Number(port) }, async (req, info) => {
    const start = Date.now();
    const url = new URL(req.url);
    const ip = getClientIp(req, info.remoteAddr.hostname);
    const userAgent = req.headers.get('user-agent') || '';

    try {
      // ---- API ROUTING ---- (shared with the Worker: app.ts)
      if (url.pathname.startsWith('/api')) {
        return await handleApi(req, ip, config().dev ? devRoutes : undefined);
      }

      // ---- STATIC SERVE ----
      for (const r of RESOURCE_FILE_ENDING) {
        if (url.pathname.endsWith(r)) {
          const filePath = `${root}${url.pathname}`;
          const cacheControl = url.searchParams.has('v') ? STATIC_IMMUTABLE : STATIC_REVALIDATE;
          return withCache(await serveFile(req, filePath), cacheControl);
        }
      }

      // ---- PAGE SERVE ----
      try {
        return withCache(await serveFile(req, `${root}/index.html`), HTML_NO_CACHE);
      } catch {
        return new Response('404 File not found', { status: 404 });
      }
    } catch (err) {
      logger.error('request', {
        method: req.method,
        path: url.pathname,
        status: 500,
        durationMs: Date.now() - start,
        ip,
        userAgent,
        error: logger.serializeError(err),
      });
      return new Response('Internal Server Error', { status: 500 });
    }
  });
}
