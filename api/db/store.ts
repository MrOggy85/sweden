// The storage contract. Two implementations: db/kvstore.ts (Deno KV: local dev and Deno
// Deploy) and cloudflare/src/d1store.ts (D1 on Workers). Routes never see either; they
// call db/users.ts and db/visits.ts, which delegate here. The entry point picks one with
// useStore() before the first request.

import type { Device, PageProgress, User, Visit } from './types.ts';

export interface Store {
  getDevice(deviceId: string): Promise<Device | null>;
  /** Stores a new device. Empty devices expire after EMPTY_DEVICE_TTL_MS unless they gain a profile. */
  putDevice(device: Device): Promise<void>;
  getUser(userId: string): Promise<User | null>;
  /** Writes the user and the device in one transaction (creation binds the profile to the device). */
  createUser(user: User, device: Device): Promise<void>;
  putUser(user: User): Promise<void>;
  /** Deletes the user, its history and stats, and writes the device in its new shape. */
  removeUser(userId: string, device: Device): Promise<void>;
  /** Records one visit and returns that page's new count for the user. */
  recordVisit(userId: string, visit: Visit): Promise<number>;
  /** Newest first. Throws on a malformed cursor. */
  listVisits(userId: string, limit: number, cursor?: string): Promise<{ items: Visit[]; cursor: string | null }>;
  listPageProgress(userId: string): Promise<{ pages: PageProgress[]; total: number }>;
  /** A real read, so a health check proves the storage answers. */
  ping(): Promise<void>;
}

/** An empty device is garbage until it holds a profile, so drive-by traffic self-cleans. */
export const EMPTY_DEVICE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** History is a rolling window; the aggregates are the durable state. */
export const VISIT_TTL_MS = 180 * 24 * 60 * 60 * 1000;

let active: Store | null = null;

export function useStore(store: Store): void {
  active = store;
}

export function store(): Store {
  if (!active) throw new Error('no store configured: call useStore() at startup');
  return active;
}
