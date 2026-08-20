import kv from './kv.ts';
import { k } from './keys.ts';
import type { Avatar, Device, User } from './types.ts';

/** An empty device is garbage until it holds a profile, so drive-by traffic self-cleans. */
const EMPTY_DEVICE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const MAX_PROFILES_PER_DEVICE = 8;
export const ID_RE = /^[A-Za-z0-9_-]{22}$/;

/**
 * 128 bits of randomness as 22 base64url chars. Enough entropy that the token needs no
 * signature — validity is proven by a KV lookup, so there is no server secret to
 * provision on Deploy.
 */
export function newId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

function deviceOptions(device: Device): { expireIn: number } | undefined {
  return device.userIds.length > 0 ? undefined : { expireIn: EMPTY_DEVICE_TTL_MS };
}

export async function getDevice(deviceId: string): Promise<Device | null> {
  const res = await kv.get<Device>(k.device(deviceId));
  return res.value;
}

export async function createDevice(): Promise<Device> {
  const device: Device = {
    id: newId(),
    userIds: [],
    activeUserId: null,
    createdAt: Date.now(),
    version: 1,
  };
  await kv.set(k.device(device.id), device, deviceOptions(device));
  return device;
}

export async function getUser(userId: string): Promise<User | null> {
  const res = await kv.get<User>(k.user(userId));
  return res.value;
}

/** Profiles on this device, in creation order. Bounded by MAX_PROFILES_PER_DEVICE. */
export async function listProfiles(device: Device): Promise<User[]> {
  const found = await Promise.all(device.userIds.map((id) => getUser(id)));
  return found.filter((u): u is User => u !== null);
}

export async function createUser(device: Device, name: string, avatar: Avatar): Promise<User> {
  const now = Date.now();
  const user: User = { id: newId(), name, avatar, createdAt: now, updatedAt: now, version: 1 };
  const next: Device = { ...device, userIds: [...device.userIds, user.id], activeUserId: user.id };

  // Writing the device without expireIn is what makes it permanent.
  await kv.atomic()
    .set(k.user(user.id), user)
    .set(k.device(next.id), next)
    .commit();

  return user;
}

export async function updateUser(user: User, patch: { name?: string; avatar?: Avatar }): Promise<User> {
  const next: User = {
    ...user,
    name: patch.name ?? user.name,
    avatar: patch.avatar ?? user.avatar,
    updatedAt: Date.now(),
  };
  await kv.set(k.user(next.id), next);
  return next;
}

export async function setActiveUser(device: Device, userId: string): Promise<User | null> {
  const user = await getUser(userId);
  if (!user) return null;
  const next: Device = { ...device, activeUserId: userId };
  await kv.set(k.device(next.id), next, deviceOptions(next));
  return user;
}

async function deletePrefix(prefix: Deno.KvKey): Promise<void> {
  const BATCH = 500;
  while (true) {
    const keys: Deno.KvKey[] = [];
    for await (const entry of kv.list({ prefix }, { limit: BATCH })) {
      keys.push(entry.key);
    }
    if (keys.length === 0) return;

    let atomic = kv.atomic();
    for (const key of keys) atomic = atomic.delete(key);
    await atomic.commit();

    if (keys.length < BATCH) return;
  }
}

/** Deletes a profile and everything derived from it. Blast radius is one device. */
export async function removeUser(device: Device, userId: string): Promise<Device> {
  await deletePrefix(k.visitsPrefix(userId));
  await deletePrefix(k.pageStatPrefix(userId));

  const userIds = device.userIds.filter((id) => id !== userId);
  const next: Device = {
    ...device,
    userIds,
    activeUserId: device.activeUserId === userId ? (userIds[0] ?? null) : device.activeUserId,
  };

  await kv.atomic()
    .delete(k.user(userId))
    .delete(k.userTotal(userId))
    .set(k.device(next.id), next)
    .commit();

  return next;
}
