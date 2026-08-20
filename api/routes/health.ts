import kv from '../db/kv.ts';
import { PAGE_IDS } from '../db/content.ts';
import { jsonResponse } from '../db/validate.ts';

/**
 * Does a real KV read, so this proves the KV binding works inside a Deploy isolate.
 * Check this first after any deploy, before trusting anything built on top of KV.
 *
 * pageIds is the server's allowlist size, generated from content/*.md — a quick sanity
 * check that content/ made it into this deploy.
 */
export async function getHealth(): Promise<Response> {
  let ok = true;
  try {
    await kv.get(['health']);
  } catch {
    ok = false;
  }
  return jsonResponse({ ok: true, kv: ok, pageIds: PAGE_IDS.length }, ok ? 200 : 503);
}
