import { store } from '../db/store.ts';
import { PAGE_IDS } from '../db/content.ts';
import { jsonResponse } from '../db/validate.ts';

/**
 * Does a real storage read, so this proves KV (Deno) or D1 (Workers) answers. Check this
 * first after any deploy, before trusting anything built on top of it.
 *
 * pageIds is the server's allowlist size, generated from content/*.md — a quick sanity
 * check that content/ made it into this deploy. The `kv` field name is kept for old probes;
 * it means "storage".
 */
export async function getHealth(): Promise<Response> {
  let ok = true;
  try {
    await store().ping();
  } catch {
    ok = false;
  }
  return jsonResponse({ ok: true, kv: ok, pageIds: PAGE_IDS.length }, ok ? 200 : 503);
}
