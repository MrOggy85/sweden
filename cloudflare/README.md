# Cloudflare Workers deployment

The same app as the Deno server, run as a Cloudflare Worker: the `/api` handler is shared
(`api/app.ts`), **D1** replaces Deno KV (`src/d1store.ts`), and the client bundle is
**Workers static assets**, on a Route under the zone's wildcard certificate.

```txt
Browser -> Cloudflare edge -> /api/*  -> Worker (rate limit, api/app.ts) -> D1
                           -> else    -> static assets (api/client), index.html for page paths
```

Storage is behind `api/db/store.ts`. The Deno server (`make dev`, and Deno Deploy until
it is switched off) plugs in `api/db/kvstore.ts`; the Worker plugs in `src/d1store.ts`.
Routes call `api/db/users.ts` / `visits.ts` and never see either.

## Tooling

Everything runs in an image built from `Dockerfile` (wrangler, deno, tsc), through `./wr`.
Nothing is installed on the host.

| Command | Does |
|---|---|
| `./wr build-client` | `deno task build` in `api/`: content generators, npm, esbuild into `api/client` |
| `./wr check` | type-check the Worker and the shared code it bundles |
| `./wr dev` | the Worker on `http://127.0.0.1:8787` with a local D1 under `.wrangler/state` |
| `./wr <wrangler args>` | wrangler itself, e.g. `./wr d1 execute DB --remote --command '…'` |
| `./deploy.sh` | bundle, check, migrations, deploy, health check |

`wrangler.jsonc` is **generated** from `wrangler.template.jsonc` and `.env` on every `./wr`
run. Edit the template. `.env` and the API token stay out of git.

Local run: `./wr d1 migrations apply DB --local`, then `./wr dev`. Housekeeping by hand:
`curl 127.0.0.1:8787/cdn-cgi/handler/scheduled`.

## First deployment

1. **The Worker and the database** (done 2026-11-18). With **Workers: Admin** on the
   token, the first `./deploy.sh` creates the Worker itself; Editor cannot. The
   database: `./wr d1 create sweden --location apac`, which the old-style **D1: Edit**
   checkbox allows (there is no D1 Admin role in the token editor). Its id goes in
   `.env` as `D1_ID`. Without those, make both in the dashboard instead.
2. `cp .env.example .env`, fill it in.
3. `./deploy.sh`, then look at it on the workers.dev address.
4. Cut-over, later: DNS → `AAAA sweden 100::`, **Proxied**. Not a Custom Domain: that
   issues a certificate for the one hostname, which publishes it in CT. The Route in
   the template sends the name to the Worker. Then `PUBLIC_URL=https://sweden.okuno.se`.

## Things that differ from Deno, and why

- **Expiry is a cron, not `expireIn`.** Empty devices (no profile) carry `expires_at` and
  are hidden after 7 days; visits are hidden after 180. The daily cron (03:23 JST)
  deletes both. A device whose last profile is deleted expires again too; on KV it was
  kept forever.
- **A user's total is `SUM(count)` over `page_stats`**, not its own counter: KV kept one
  because it cannot sum. The two were always equal.
- **Visit cursors are `<at>:<id>`**, not KV's opaque cursor. The client treats both as
  opaque.
- **Client address: `CF-Connecting-IP`**, set by the edge. The rate limit (300 `/api`
  requests a minute per address) keeps a scanner from filling D1 with device rows,
  since every cookieless request mints one.
- **Cache headers on files** are Workers' defaults (revalidate with ETag), not the Deno
  server's `immutable` for `?v=` URLs. Correct either way; a little chattier.
- **A missing file with a known extension** (say a deleted `.m4a`) gets index.html with
  200 here, where the Deno server answered 404.
