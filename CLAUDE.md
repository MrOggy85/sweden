# Sweden

An interactive web experience for kids to learn about Sweden. Server-backed: it stores who
is using it (a nickname and an avatar) and which topics they have looked at.

See `PROJECT.md` for the design contract — what this is for, what it deliberately is not,
and why the data model looks the way it does. Read it before adding features.

## Layout

- `api/` — Deno server. Zero npm dependencies, JSR imports only. Serves the API and the
  built client from a single origin on one port.
- `client/` — React 18 frontend, bundled by esbuild driven from Deno. Build output goes to
  `api/client/` (gitignored).

```sh
make install    # npm install for the client (the api needs nothing)
make dev        # :8777 — also spawns the esbuild watcher as a child process
make check      # deno check + tsc --noEmit
make fmt
make build      # production bundle into api/client/
make deploy     # build, then deployctl to Deno Deploy
```

## Conventions

- **Routing is hand-written.** One `Deno.serve` handler in `api/server.ts` with
  `if (pathname === X && method === Y)` branches. Do not add a router library. Avoid path
  params; the subject of a request is the active profile from the cookie.
- **One file per endpoint group** under `api/routes/`, each exporting a function that
  returns a `Response`.
- **All KV access goes through `api/db/`.** Routes never call `kv` directly — that
  indirection is what makes the storage layer swappable.
- **Key layout lives only in `api/db/keys.ts`.** Read the comments there before adding a
  key; the ordering choices are load-bearing.
- **CSS Modules, co-located.** `Component/Component.tsx` next to `Component.module.css`.
  No Tailwind, no CSS-in-JS. Globals go in `App.module.css` via `:global(...)`.
- **No state library.** Plain hooks plus the fetch wrappers in `client/src/data/api.ts`.
- **Formatting** is `deno fmt` with `lineWidth: 120`, single quotes, semicolons — configured
  in `api/deno.json` and `client/deno.json`. Run `make fmt`.
- **Touch targets** are at least 44px. The target devices are an iPad and an iPhone.

## Two invariants that are easy to break

1. **Types are hand-duplicated.** `api/db/types.ts` and `client/src/data/types.ts` mirror
   each other, and nothing enforces it. Edit both together.
2. **So are the allowlists.** `PAGE_IDS`, `ANIMAL_IDS` and `COLOR_IDS` exist in
   `api/db/content.ts` and again in `client/src/data/pages.ts`. `GET /api/health` reports
   the server's page count so drift is visible.

## Adding a topic page

1. Add an entry to `PAGES` in `client/src/data/pages.ts` (id, title, emoji, blurb, facts).
2. Add the same id to `PAGE_IDS` in `api/db/content.ts` — otherwise `POST /api/visits`
   rejects it with `400 unknown pageId` and the visit is never recorded.

No other wiring is needed: `PageGrid` renders whatever is in `PAGES`.

## Do not

- Add a `setInterval` tick loop or any background timer. Deno Deploy isolates are
  ephemeral and get reclaimed when idle; anything periodic must be request-triggered.
- Cache identity or sessions in module scope, for the same reason.
- Write a plain number to a key that `sum` mutates — those values must stay `Deno.KvU64`
  or every later `sum` on that key throws.
