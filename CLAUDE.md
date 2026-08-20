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
- `content/` — one Markdown file per topic (YAML-ish frontmatter + a bullet list of
  facts). `scripts/generate-content.ts` compiles it into `PAGE_IDS`/`PAGES`; see
  "Adding a topic page" below.

```sh
make install           # npm install for the client (the api needs nothing)
make generate-content  # content/*.md -> PAGE_IDS / PAGES (also run by dev/build/check)
make dev               # :8777 — also spawns the esbuild watcher as a child process
make check             # deno check + tsc --noEmit
make fmt
make build             # production bundle into api/client/
make deploy            # build, then deployctl to Deno Deploy
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
2. **`ANIMAL_IDS` and `COLOR_IDS` are hand-duplicated** between `api/db/content.ts` and
   `client/src/data/pages.ts` — edit both together. `PAGE_IDS`/`PAGES` used to be a third
   copy of this problem; they are now both generated from `content/*.md` by
   `scripts/generate-content.ts`, so they cannot drift from each other.

## Adding a topic page

1. Create `content/<id>.md`: frontmatter with `id`, `order` (an integer — controls grid
   position, leave gaps between topics so you can insert later), `title`, `emoji`, `blurb`,
   then a Markdown bullet list of facts in the body. `id` must match the filename stem.
2. Run `make generate-content` — or just `make dev` / `make build` / `make check`, which
   depend on it. This writes `api/db/content.generated.ts` and
   `client/src/data/pages.generated.ts` (both gitignored).

No other wiring is needed: `PageGrid` renders whatever ends up in `PAGES`, and an unknown
`pageId` is rejected by `POST /api/visits` automatically since both come from the same
`content/` source.

## Do not

- Add a `setInterval` tick loop or any background timer. Deno Deploy isolates are
  ephemeral and get reclaimed when idle; anything periodic must be request-triggered.
- Cache identity or sessions in module scope, for the same reason.
- Write a plain number to a key that `sum` mutates — those values must stay `Deno.KvU64`
  or every later `sum` on that key throws.
- Combine an unscoped `--allow-read` with a scoped `--allow-write` in a task that opens
  KV. `Deno.openKv` then fails with `NotCapable: Requires write access` no matter how the
  write path is spelled. Either scope both (see the `start` task) or use `-A` (see `dev`).
- Narrow the client watcher's `--allow-sys` in `api/main.ts`. `esbuild-css-modules-plugin`
  reaches `os.cpus()` via lightningcss/detect-libc, and a narrower grant kills the watcher
  on startup **silently** — the server keeps serving the previously built bundle, so the
  only symptom is a `client watcher exited` log line.
