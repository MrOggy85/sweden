// The /api handler, shared by the Deno server (server.ts) and the Worker
// (cloudflare/src/index.ts). Runtime-free: no Deno global, no filesystem. Static files and
// the SPA fallback are each runtime's own business.

import logger from './logger.ts';
import { resolveIdentity, withCookie } from './identity.ts';
import { getMe } from './routes/me.ts';
import { deleteUsers, patchUsers, postUsers } from './routes/users.ts';
import { postSession } from './routes/session.ts';
import { getVisits, postVisits } from './routes/visits.ts';
import { getPages } from './routes/pages.ts';
import { getHealth } from './routes/health.ts';

/** Extra routes a runtime adds after identity (the Deno server's local-only /api/dev). */
export type ExtraRoutes = (req: Request, url: URL) => Promise<Response | null>;

export async function handleApi(
  req: Request,
  ip: string,
  extra?: ExtraRoutes,
): Promise<Response> {
  const start = Date.now();
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';

  try {
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
        resp = (await extra?.(req, url)) ?? new Response('404 Not Found', { status: 404 });
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
}
