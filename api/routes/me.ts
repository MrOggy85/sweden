import type { Identity } from '../identity.ts';
import { listProfiles } from '../db/users.ts';
import { jsonResponse } from '../db/validate.ts';

/**
 * Always 200, never 401. "No profile yet" is a normal state that tells the client to show
 * the create-profile screen. The device id is not in the response — it is a credential.
 */
export async function getMe(idn: Identity): Promise<Response> {
  const profiles = await listProfiles(idn.device);
  return jsonResponse({ user: idn.user, profiles });
}
