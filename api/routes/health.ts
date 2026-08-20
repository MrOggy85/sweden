import kv from '../db/kv.ts';
import { k } from '../db/keys.ts';
import { PAGE_IDS } from '../db/content.ts';
import { jsonResponse } from '../db/validate.ts';

/**
 * Does a real KV read, so this proves the KV binding works inside a Deploy isolate.
 * Check this first after any deploy, before trusting anything built on top of KV.
 *
 * pageIds is the server's allowlist size — it makes drift against the client's copy of
 * PAGE_IDS visible without digging through 400s.
 */
export async function getHealth(): Promise<Response> {
  let ok = true;
  try {
    await kv.get(k.health());
  } catch {
    ok = false;
  }
  return jsonResponse({ ok: true, kv: ok, pageIds: PAGE_IDS.length }, ok ? 200 : 503);
}
