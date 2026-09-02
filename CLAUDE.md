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
  facts, optionally a `## Words` section). `scripts/generate-content.ts` compiles it into
  `PAGE_IDS`/`PAGES`; see "Adding a topic page" below.
- `content/games/` — content for mini-games rather than topic pages: `connect-pairs.md`
  (word/icon pairs) and `phrases.md` (celebration phrases), compiled by
  `scripts/generate-game-content.ts`; see "Adding a game word pair" below.
- `client/static/` — copied recursively into `api/client/` by the build. `media/` holds the
  committed pronunciation clips.

```sh
make install           # npm install for the client (the api needs nothing)
make generate-content  # content/**/*.md -> PAGE_IDS/PAGES + game content (also run by dev/build/check)
make generate-audio    # `## Words` -> client/static/media/*.m4a (macOS only, by hand)
make audio-variants    # encode one word at several bitrates and print the sizes (macOS)
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
- **Client routing is hand-written too.** `client/src/core/navigate.ts` is `pushState` plus
  one registered callback; `App.tsx` holds `location.pathname` in state, listens for
  `popstate`, and picks a component from it. No router library. The route table is `/` for
  the grid, `/<pageId>` for a topic and `/dev...` for diagnostics, which works on refresh
  only because the server answers every extensionless path with `index.html` — do not add
  an extension-like segment to a route, or the static branch in `api/server.ts` will try to
  serve it as a file. Routes that are not page ids belong in `RESERVED_IDS`
  (`scripts/content.ts`), so a content file cannot be authored into an unreachable URL.
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

## Three invariants that are easy to break

1. **Types are hand-duplicated.** `api/db/types.ts` and `client/src/data/types.ts` mirror
   each other, and nothing enforces it. Edit both together.
2. **`PageKind` is hand-duplicated** between `scripts/content.ts` (`PAGE_KINDS`) and
   `client/src/data/pages.ts` — edit both together.
3. **`ANIMAL_IDS` and `COLOR_IDS` are hand-duplicated** between `api/db/content.ts` and
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

## Adding a spoken word

A topic can end with a `## Words` section — bullets of `swedish | english`, plus an
optional third field naming the group the button renders under. Facts are the bullets
*before* the first `##` heading; bullets under any other heading are ignored.

```md
## Words

- hej då | bye
- katt | cat | things
```

1. Add the row, then run `make generate-audio` **on macOS** — `say` and `afconvert` do not
   exist on Deno Deploy or in the dev container. It writes `client/static/media/<slug>.m4a`
   and skips clips that already exist. Script flags go through `ARGS`, since bare flags
   would be read by make itself: `make generate-audio ARGS=--force`, or
   `ARGS=--voice=Klara`.
2. Commit the `.m4a`. Unlike the generated TypeScript, clips are committed assets.

The filename is derived from the Swedish word by `scripts/content.ts` — never write a path
in `content/`. `make generate-content` fails when a clip is missing, so a forgotten
`make generate-audio` breaks the Deno Deploy build rather than shipping a button that
plays nothing.

It also fails when two *different* words derive the same filename. Game pairs share this
namespace: `katt` in `content/games/connect-pairs.md` is the same clip as `katt` on a
topic page, recorded once. `slug()` folds å/ä/ö
onto a/a/o, so `har` and `här` collide; the same word on two pages is fine and shares one
clip. Rename one of the pair — there is no per-page namespace, on purpose, so a word is
recorded once however many topics use it.

## Runtime speech (`speechSynthesis`)

Available and known to work — the browser's own TTS, present in every browser on macOS and
iOS (on iOS every browser is WebKit underneath). `client/src/Dev/Voices.tsx` is the only
caller today, and it is a diagnostic. **Nothing user-facing uses it, deliberately.**

Reach for it only for text assembled at runtime that could not have been prerecorded — a
count that varies, a name typed by a child. Everything a child is meant to *learn* stays a
prerecorded clip, because the voice comes from the OS and the same word will sound
different on the next device. That is the line `PROJECT.md`'s Sound section draws.

- Disposable and varies per interaction → `speechSynthesis`. e.g. "Bra! Fem ord!"
- Vocabulary, or anything repeated back as correct → a clip from `## Words`.
- Don't put the two in one breath. A device voice straight after Alva's clips reads as a
  different speaker interrupting, which is worse than staying silent.

Two traps if you do use it: `getVoices()` returns `[]` on the first synchronous call (wait
for `voiceschanged`), and iOS needs a user gesture to start speech. `/dev/voices` reports
what a given device actually has.

## Adding a sound effect

Drop the download in `client/static/media/sfx/`, then on macOS:

```sh
make convert-sfx            # any format -> .m4a, 64 kbps, source deleted
```

64 kbps, not the 24 kbps the speech clips use: a word survives 24, an animal call does not.
`ARGS=--bitrate=96000`, `ARGS=--mono`, `ARGS=--force` to redo, `ARGS=--keep` to hold on to
the source.

**The source is deleted after conversion, and that is enforced twice.** `convert-sfx`
removes it once the output is confirmed to be a real MP4 of plausible size, and
`generate-content` refuses to run while any file with a source extension is left in `sfx/`
— the build copies `static/` wholesale, so a forgotten download ships next to the file it
produced. Non-audio files (a `CREDITS.md`) are ignored by both.

Reference it from a content file with a `## Sounds` section — label, then the bare
filename; the folder and `.m4a` are implied, and writing either is an error:

```md
## Sounds

- Mjau | cat-meow1
```

Unlike a word clip, this filename is authored rather than derived, so `generate-content`
checks the file exists and names it when it does not.

## Page kinds

`kind` in the frontmatter picks the renderer, defaulting to `topic`:

- `topic` — blurb, facts, and any `## Words` as tap-to-hear buttons (`PageView.tsx`).
- `sentence` — facts as instructions, then `SentenceBuilder`: tap words into a box, press
  Speak, and the clips play in order. `content/sentence.md` is the only one today.

An unknown `kind` is a generate-content error. Adding one means a new value in `PAGE_KINDS`
(`scripts/content.ts`), a branch in `PageView.tsx`, and the matching union in
`client/src/data/pages.ts` — that union is hand-duplicated, like `ANIMAL_IDS`.

## The dev area

`/dev` is a permanent diagnostics area, opened by **tapping the `build …` footer five
times within 1.5 s** — the Android build-number gesture. There is no link to it, since the
users are children; the footer stays visually identical to the text it replaced.

It renders before the loading and error branches in `App.tsx`, deliberately: the
diagnostics are most wanted when the app itself will not come up. It needs no profile.

Add a tool by writing a component under `client/src/Dev/` and adding one entry to `TOOLS`
in `DevPage.tsx`. `/dev/voices` is the first: it answers what `speechSynthesis` offers on
the device in hand, which is the thing PROJECT.md's sound section says varies and which no
amount of local testing on a Mac can settle for an iPad.

## Adding a game word pair

The "connect the words" game (`client/src/ConnectGame/`) draws its content from
`content/games/`, not from a topic page — a game pair isn't a topic (no facts, no
frontmatter) and games have no visits/score, so nothing here touches the server or KV.

```md
- ko | cow | cow
```

1. Add a bullet to `content/games/connect-pairs.md`, written as
   `swedish | english | icon`. `icon` must match a key in
   `client/src/GameIcons/GameIcons.tsx` — either an object icon (add one if the pair needs
   a new picture) or `color-<name>` for one of the eight `COLOR_IDS`.
2. Run `make generate-audio` **on macOS**, same as a topic word — it covers both
   `content/*.md` and `content/games/connect-pairs.md` in one pass. Commit the new `.m4a`.
3. Run `make generate-content` (or `make dev` / `make build` / `make check`) to regenerate
   `client/src/data/gameContent.generated.ts`. This fails the same way a missing topic clip
   does if the audio was not generated first.

To add a celebration phrase (shown at random when a round is finished), add a bullet to
`content/games/phrases.md` — plain Swedish text, no audio.

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
