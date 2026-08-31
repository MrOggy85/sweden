import { serveFile } from 'jsr:@std/http/file-server';
import { fromFileUrl } from 'jsr:@std/path';
import logger, { getClientIp } from './logger.ts';
import { resolveIdentity, withCookie } from './identity.ts';
import { getMe } from './routes/me.ts';
import { deleteUsers, patchUsers, postUsers } from './routes/users.ts';
import { postSession } from './routes/session.ts';
import { getVisits, postVisits } from './routes/visits.ts';
import { getPages } from './routes/pages.ts';
import { getHealth } from './routes/health.ts';

// Anything not listed here falls through to the SPA and is answered with index.html and a
// 200 — a missing audio extension looks like a working request that plays nothing.
const RESOURCE_FILE_ENDING = [
  '.ico',
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
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

export function init(host: string, port: string) {
  return Deno.serve({ hostname: host, port: Number(port) }, async (req, info) => {
    const start = Date.now();
    const url = new URL(req.url);
    const ip = getClientIp(req, info.remoteAddr.hostname);
    const userAgent = req.headers.get('user-agent') || '';

    try {
      // ---- API ROUTING ----
      if (url.pathname.startsWith('/api')) {
        let resp: Response;
        let userId: string | null = null;

        if (url.pathname === '/api/health' && req.method === 'GET') {
          // Deliberately skips identity so probes do not mint device records.
          resp = await getHealth();
        } else {
          const idn = await resolveIdentity(req);
          userId = idn.user?.id ?? null;

          if (url.pathname === '/api/me' && req.method === 'GET') {
            resp = await getMe(idn);
          } else if (url.pathname === '/api/users' && req.method === 'POST') {
            resp = await postUsers(req, idn);
          } else if (url.pathname === '/api/users' && req.method === 'PATCH') {
            resp = await patchUsers(req, idn);
          } else if (url.pathname === '/api/users' && req.method === 'DELETE') {
            resp = await deleteUsers(idn);
          } else if (url.pathname === '/api/session' && req.method === 'POST') {
            resp = await postSession(req, idn);
          } else if (url.pathname === '/api/visits' && req.method === 'POST') {
            resp = await postVisits(req, idn);
          } else if (url.pathname === '/api/visits' && req.method === 'GET') {
            resp = await getVisits(url, idn);
          } else if (url.pathname === '/api/pages' && req.method === 'GET') {
            resp = await getPages(idn);
          } else {
            resp = new Response('404 Not Found', { status: 404 });
          }

          if (idn.setCookie) resp = withCookie(resp, idn.setCookie);
        }

        // userId only — the device id is a credential and is never logged.
        logger.info('request', {
          method: req.method,
          path: url.pathname,
          status: resp.status,
          durationMs: Date.now() - start,
          ip,
          userAgent,
          userId,
        });
        return resp;
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
