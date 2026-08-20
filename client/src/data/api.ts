// Thin fetch wrappers. Same-origin, so cookies ride along with credentials: 'same-origin'
// and there is no CORS or token handling to do.

import type { Avatar, Me, PageProgress, User, Visit, VisitKind } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(path, {
    credentials: 'same-origin',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init,
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `request failed: ${resp.status}`);
  }
  return await resp.json() as T;
}

export function getMe(): Promise<Me> {
  return request<Me>('/api/me');
}

export function createUser(name: string, avatar: Avatar): Promise<{ user: User }> {
  return request<{ user: User }>('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, avatar }),
  });
}

export function updateUser(patch: { name?: string; avatar?: Avatar }): Promise<{ user: User }> {
  return request<{ user: User }>('/api/users', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function selectProfile(userId: string): Promise<{ user: User }> {
  return request<{ user: User }>('/api/session', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function recordVisit(pageId: string, kind: VisitKind = 'view'): Promise<{ ok: true; count: number }> {
  return request<{ ok: true; count: number }>('/api/visits', {
    method: 'POST',
    body: JSON.stringify({ pageId, kind }),
  });
}

export function getVisits(limit = 20): Promise<{ items: Visit[]; cursor: string | null }> {
  return request<{ items: Visit[]; cursor: string | null }>(`/api/visits?limit=${limit}`);
}

export function getPages(): Promise<{ pages: PageProgress[]; total: number }> {
  return request<{ pages: PageProgress[]; total: number }>('/api/pages');
}
