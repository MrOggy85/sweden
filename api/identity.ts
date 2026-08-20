// One cookie, holding a device id and nothing else.
//
// The active profile lives server-side in Device.activeUserId rather than in the cookie,
// so switching profiles is a single server-side write that cannot desync from the cookie.
// The device id is a bearer credential: HttpOnly, and never logged.

import { createDevice, getDevice, getUser, ID_RE } from './db/users.ts';
import type { Device, User } from './db/types.ts';

const COOKIE_NAME = 'sw_did';
/** 400 days — Chrome clamps anything longer, so ask for exactly the ceiling. */
const COOKIE_MAX_AGE = 34_560_000;

const DEV = Deno.env.get('DEV') === '1';

export type Identity = {
  device: Device;
  user: User | null;
  setCookie: string | null;
};

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

function serializeCookie(value: string): string {
  const attrs = [`${COOKIE_NAME}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${COOKIE_MAX_AGE}`];
  // Secure is omitted in dev on purpose: testing on a real iPad means
  // http://<lan-ip>:8777, and a Secure cookie is silently dropped there — only
  // localhost is exempt. On Deploy it is always set.
  if (!DEV) attrs.push('Secure');
  return attrs.join('; ');
}

/**
 * Resolved from cookie + KV on every request. Nothing is cached in module scope, because
 * Deploy isolates are ephemeral and there are many of them.
 */
export async function resolveIdentity(req: Request): Promise<Identity> {
  const raw = readCookie(req, COOKIE_NAME);

  if (raw && ID_RE.test(raw)) {
    const device = await getDevice(raw);
    if (device) {
      const user = device.activeUserId ? await getUser(device.activeUserId) : null;
      return { device, user, setCookie: null };
    }
  }

  // No cookie, a malformed one, or one naming a device we have never seen: mint a fresh
  // device rather than trusting the presented id, otherwise a client could pre-seed
  // arbitrary device ids.
  const device = await createDevice();
  return { device, user: null, setCookie: serializeCookie(device.id) };
}

/** Clones the response to attach Set-Cookie, mirroring withCache in server.ts. */
export function withCookie(resp: Response, setCookie: string): Response {
  const headers = new Headers(resp.headers);
  headers.append('set-cookie', setCookie);
  return new Response(resp.body, { status: resp.status, headers });
}
