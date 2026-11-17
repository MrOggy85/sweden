import { store } from './store.ts';
import type { PageProgress, Visit } from './types.ts';

export const VISITS_LIMIT_DEFAULT = 50;
export const VISITS_LIMIT_MAX = 100;
export const CURSOR_MAX = 512;

export function recordVisit(userId: string, visit: Visit): Promise<number> {
  return store().recordVisit(userId, visit);
}

export function listVisits(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<{ items: Visit[]; cursor: string | null }> {
  return store().listVisits(userId, limit, cursor);
}

export function listPageProgress(userId: string): Promise<{ pages: PageProgress[]; total: number }> {
  return store().listPageProgress(userId);
}
