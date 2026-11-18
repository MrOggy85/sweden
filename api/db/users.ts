import { store } from './store.ts';
import type { Avatar, Device, User } from './types.ts';

export const MAX_PROFILES_PER_DEVICE = 8;
export const ID_RE = /^[A-Za-z0-9_-]{22}$/;

/**
 * 128 bits of randomness as 22 base64url chars. Enough entropy that the token needs no
 * signature — validity is proven by a storage lookup, so there is no server secret to
 * provision.
 */
export function newId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export function getDevice(deviceId: string): Promise<Device | null> {
  return store().getDevice(deviceId);
}

export async function createDevice(): Promise<Device> {
  const device: Device = {
    id: newId(),
    userIds: [],
    activeUserId: null,
    createdAt: Date.now(),
    version: 1,
  };
  await store().putDevice(device);
  return device;
}

export function getUser(userId: string): Promise<User | null> {
  return store().getUser(userId);
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
  await store().createUser(user, next);
  return user;
}

export async function updateUser(user: User, patch: { name?: string; avatar?: Avatar }): Promise<User> {
  const next: User = {
    ...user,
    name: patch.name ?? user.name,
    avatar: patch.avatar ?? user.avatar,
    updatedAt: Date.now(),
  };
  await store().putUser(next);
  return next;
}

export async function setActiveUser(device: Device, userId: string): Promise<User | null> {
  const user = await getUser(userId);
  if (!user) return null;
  await store().putDevice({ ...device, activeUserId: userId });
  return user;
}

/** Deletes a profile and everything derived from it. Blast radius is one device. */
export async function removeUser(device: Device, userId: string): Promise<Device> {
  const userIds = device.userIds.filter((id) => id !== userId);
  const next: Device = {
    ...device,
    userIds,
    activeUserId: device.activeUserId === userId ? (userIds[0] ?? null) : device.activeUserId,
  };
  await store().removeUser(userId, next);
  return next;
}
