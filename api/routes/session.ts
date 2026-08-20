import type { Identity } from '../identity.ts';
import { ID_RE, setActiveUser } from '../db/users.ts';
import { errorResponse, jsonResponse, readJson } from '../db/validate.ts';

/**
 * Switches the active profile. The membership check is what stops a device from binding
 * someone else's profile — they would have to guess a 128-bit id first, but check anyway.
 *
 * The active profile is device-global, so two tabs on the same iPad share it. That is the
 * intended model: "this iPad is currently Astrid's".
 */
export async function postSession(req: Request, idn: Identity): Promise<Response> {
  const parsed = await readJson<{ userId?: unknown }>(req);
  if (!parsed.ok) return parsed.resp;

  const userId = parsed.value.userId;
  if (typeof userId !== 'string' || !ID_RE.test(userId)) {
    return errorResponse('invalid userId', 400);
  }
  if (!idn.device.userIds.includes(userId)) {
    return errorResponse('not on this device', 403);
  }

  const user = await setActiveUser(idn.device, userId);
  if (!user) return errorResponse('unknown profile', 404);

  return jsonResponse({ user });
}
