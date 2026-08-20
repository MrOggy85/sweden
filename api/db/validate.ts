// Clamp what is cosmetic, reject what must be exact.
//
// A name that is too long is a UX problem, so it gets truncated. A bad avatar or pageId
// is rejected outright: pageId becomes part of a KV key, so accepting an unknown one
// would let any client grow the key space permanently.

import { ANIMAL_IDS, COLOR_IDS } from './content.ts';
import type { Avatar } from './types.ts';

export const NAME_MAX = 24;
const MAX_BODY_BYTES = 2048;

export type Parsed<T> = { ok: true; value: T } | { ok: false; resp: Response };

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function errorResponse(error: string, status: number): Response {
  return jsonResponse({ error }, status);
}

/** Reads a JSON body, capped well below KV's 64 KiB value limit. */
export async function readJson<T>(req: Request): Promise<Parsed<T>> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { ok: false, resp: errorResponse('body too large', 413) };
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, resp: errorResponse('invalid body', 400) };
  }
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, resp: errorResponse('body too large', 413) };
  }

  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, resp: errorResponse('invalid json', 400) };
  }
}

/**
 * Normalizes a nickname. Strips control/zero-width/bidi characters (a display-spoofing
 * vector), collapses whitespace, then truncates by code point so an emoji name never
 * gets cut into a broken surrogate pair. Returns null only if nothing is left.
 */
export function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const stripped = raw.normalize('NFC').replace(/\p{C}/gu, '').replace(/\s+/gu, ' ').trim();
  if (stripped.length === 0) return null;
  return Array.from(stripped).slice(0, NAME_MAX).join('');
}

export function cleanAvatar(raw: unknown): Avatar | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const { animal, color } = raw as Record<string, unknown>;
  if (typeof animal !== 'string' || !(ANIMAL_IDS as readonly string[]).includes(animal)) return null;
  if (typeof color !== 'string' || !(COLOR_IDS as readonly string[]).includes(color)) return null;
  return { animal, color } as Avatar;
}

export function clampInt(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
