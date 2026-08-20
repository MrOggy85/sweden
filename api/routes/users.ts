import type { Identity } from '../identity.ts';
import { createUser, MAX_PROFILES_PER_DEVICE, removeUser, updateUser } from '../db/users.ts';
import type { Avatar } from '../db/types.ts';
import { cleanAvatar, cleanName, errorResponse, jsonResponse, readJson } from '../db/validate.ts';

type UserBody = { name?: unknown; avatar?: unknown };

export async function postUsers(req: Request, idn: Identity): Promise<Response> {
  const parsed = await readJson<UserBody>(req);
  if (!parsed.ok) return parsed.resp;

  const name = cleanName(parsed.value.name);
  if (!name) return errorResponse('invalid name', 400);

  const avatar = cleanAvatar(parsed.value.avatar);
  if (!avatar) return errorResponse('invalid avatar', 400);

  if (idn.device.userIds.length >= MAX_PROFILES_PER_DEVICE) {
    return errorResponse('too many profiles', 409);
  }

  const user = await createUser(idn.device, name, avatar);
  return jsonResponse({ user }, 201);
}

/** Edits the active profile. */
export async function patchUsers(req: Request, idn: Identity): Promise<Response> {
  if (!idn.user) return errorResponse('no active profile', 404);

  const parsed = await readJson<UserBody>(req);
  if (!parsed.ok) return parsed.resp;

  const patch: { name?: string; avatar?: Avatar } = {};

  if (parsed.value.name !== undefined) {
    const name = cleanName(parsed.value.name);
    if (!name) return errorResponse('invalid name', 400);
    patch.name = name;
  }

  if (parsed.value.avatar !== undefined) {
    const avatar = cleanAvatar(parsed.value.avatar);
    if (!avatar) return errorResponse('invalid avatar', 400);
    patch.avatar = avatar;
  }

  const user = await updateUser(idn.user, patch);
  return jsonResponse({ user });
}

/** Deletes the active profile and all of its history. */
export async function deleteUsers(idn: Identity): Promise<Response> {
  if (!idn.user) return errorResponse('no active profile', 404);
  await removeUser(idn.device, idn.user.id);
  return jsonResponse({ ok: true });
}
