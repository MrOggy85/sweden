import type { Identity } from '../identity.ts';
import { isPageId, isVisitKind } from '../db/content.ts';
import type { Visit } from '../db/types.ts';
import { CURSOR_MAX, listVisits, recordVisit, VISITS_LIMIT_DEFAULT, VISITS_LIMIT_MAX } from '../db/visits.ts';
import { clampInt, errorResponse, jsonResponse, readJson } from '../db/validate.ts';

type VisitBody = { pageId?: unknown; kind?: unknown; ms?: unknown; score?: unknown };

/**
 * 202, not 200: recording a visit is fire-and-forget telemetry and the client must never
 * block a page transition on it. The new count comes back so the UI can update a badge
 * without a second request.
 */
export async function postVisits(req: Request, idn: Identity): Promise<Response> {
  if (!idn.user) return errorResponse('no active profile', 404);

  const parsed = await readJson<VisitBody>(req);
  if (!parsed.ok) return parsed.resp;

  const { pageId, kind } = parsed.value;
  if (!isPageId(pageId)) return errorResponse('unknown pageId', 400);
  if (!isVisitKind(kind)) return errorResponse('invalid kind', 400);

  const visit: Visit = { pageId, kind, at: Date.now() };
  if (parsed.value.ms !== undefined) visit.ms = clampInt(parsed.value.ms, 0, 3_600_000, 0);
  if (parsed.value.score !== undefined) visit.score = clampInt(parsed.value.score, 0, 100, 0);

  const count = await recordVisit(idn.user.id, visit);
  return jsonResponse({ ok: true, count }, 202);
}

export async function getVisits(url: URL, idn: Identity): Promise<Response> {
  if (!idn.user) return errorResponse('no active profile', 404);

  const limit = clampInt(url.searchParams.get('limit'), 1, VISITS_LIMIT_MAX, VISITS_LIMIT_DEFAULT);
  const cursor = url.searchParams.get('cursor') ?? undefined;
  if (cursor !== undefined && cursor.length > CURSOR_MAX) {
    return errorResponse('invalid cursor', 400);
  }

  try {
    const page = await listVisits(idn.user.id, limit, cursor);
    return jsonResponse(page);
  } catch {
    // kv.list throws on a malformed cursor.
    return errorResponse('invalid cursor', 400);
  }
}
