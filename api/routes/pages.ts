import type { Identity } from '../identity.ts';
import { listPageProgress } from '../db/visits.ts';
import { errorResponse, jsonResponse } from '../db/validate.ts';

/** Which parts of Sweden this profile has explored, and how often. */
export async function getPages(idn: Identity): Promise<Response> {
  if (!idn.user) return errorResponse('no active profile', 404);
  const progress = await listPageProgress(idn.user.id);
  return jsonResponse(progress);
}
