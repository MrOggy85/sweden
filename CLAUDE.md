# Sweden

An interactive web app for kids learning Swedish as a third language (after Japanese and
English). Server-backed: it stores a nickname + avatar per profile and which topics each
profile has looked at. `PROJECT.md` is the design contract — read it before adding features.

## Layout

- `api/` — Deno server, JSR imports only, no npm. Serves the API and the built client on one
  port.
- `client/` — React 18, bundled by esbuild driven from Deno into `api/client/` (gitignored).
  `client/static/` is copied in wholesale; `static/media/` holds the committed clips.
- `content/*.md` — one file per topic page. `content/games/` — game content.
  `scripts/generate-*.ts` compile both into gitignored `*.generated.ts` modules.

```sh
make install           # npm install for the client
make generate-content  # content -> generated TS (dev/build/check run it first)
make generate-audio    # Swedish words -> client/static/media/*.m4a  (macOS only)
make convert-sfx       # sound effect download -> .m4a, source deleted (macOS only)
make dev               # :8777, also runs the esbuild watcher
make check             # deno check + tsc --noEmit — the only automated gate
make fmt               # deno fmt, lineWidth 120, single quotes, semicolons
make build / deploy    # production bundle / deployctl to Deno Deploy
```

macOS-only scripts take flags through `ARGS`: `make generate-audio ARGS=--force`,
`ARGS=--voice=Klara`, `ARGS=--only=banan`.

## Conventions

- **No router libraries.** Server: one `Deno.serve` handler in `api/server.ts` with
  `if (pathname === X && method === Y)` branches, one file per endpoint group in
  `api/routes/`, no path params (the subject is the active profile from the cookie).
  Client: `core/navigate.ts` (`pushState` + one callback) and a pathname switch in
  `App.tsx`. Refresh works because the server answers every extensionless path with
  `index.html`, so never give a route an extension-like segment. Non-page routes go in
  `RESERVED_IDS` (`scripts/content.ts`).
- **KV only through `api/db/`**; key layout only in `api/db/keys.ts` (read its comments —
  the ordering is load-bearing).
- **CSS Modules, co-located** (`X/X.tsx` + `X.module.css`). Globals via `:global(...)` in
  `App.module.css`. No Tailwind, no CSS-in-JS, no state library.
- **Touch targets ≥ 44px.** Target devices are an iPad and an iPhone.
- **Comments:** only what the code cannot say — intent, a ruled-out alternative, a gotcha.
  One line where possible; longer belongs here, with a pointer.

## Hand-duplicated — edit both sides

1. `api/db/types.ts` ↔ `client/src/data/types.ts`
2. `PAGE_KINDS` in `scripts/content.ts` ↔ `PageKind` in `client/src/data/pages.ts`
3. `ANIMAL_IDS` / `COLOR_IDS` in `api/db/content.ts` ↔ `client/src/data/pages.ts`

`PAGE_IDS`/`PAGES` are both generated from `content/`, so they cannot drift.

## Content: show, don't tell

A page never *tells* a child anything in English. No fact lists, no visible captions, no
English glosses. The `blurb`, image captions, video labels and a word's English are
metadata for screen readers only. Meaning comes from a picture; words come as Swedish you
hear when you tap.

### A topic page

```md
---
id: animals          # must match the filename
order: 60            # grid position; leave gaps
title: Djur          # Swedish
emoji: 🦌
blurb: Moose, lynx, and a lot of forest.   # metadata, never shown
when: 24 december    # högtider only
kind: sentence       # optional: topic (default) | sentence
---

- 🫎 | en stor älg            # scenes: everything before the first ##
- 🦊🌲 | en räv i skogen

## Words
- älg | moose | 🫎            # swedish | english | emoji [| group]

## Sounds
- Kuckeliku | rooster | 🐓    # label | sfx filename (no folder, no .m4a) [| emoji]

## Images
- An älg eating leaves | animals.jpg   # alt text | file in media/img/

## Video
- youtube | 7z6FJEf_kKI | Dancing around the pole   # id, not URL

## Links
- katt                        # bare page ids, or `connect`
```

No other wiring: `PageGrid` renders whatever is in `PAGES`, and the server's visit
allowlist comes from the same source. Bullets under any other heading are ignored.

**Scenes** are the heart of a page. The emoji is the picture; tapping plays the Swedish
word by word, each word lit as it plays. Every scene word is a clip, exactly like a
`## Words` entry.
- Reuse existing clips before adding one (`ls client/static/media`).
- At most three emoji, or the panel wraps.
- `_` holds a two-word clip together (`hej_då` → `hej-da.m4a`). Trailing `!?.,` is shown,
  not said.
- If it can't be drawn with three emoji and a few Swedish words, it isn't for this
  audience.

**Words** render as picture cards. The emoji replaces the English. The optional fourth
field groups the sentence builder's palette (`och | and | | 🔗` for no emoji).

**Links** are authored once: the reverse is added automatically, so writing both
directions is an error. `PageLinks` shows at most six.

**Kinds:** `topic` renders scenes and picture cards. `sentence` renders `SentenceBuilder`
instead (tap words into a box, 🔊 plays them in order). A new kind needs `PAGE_KINDS`, a
branch in `PageView.tsx`, and the client union.

### Audio clips

A word's filename is derived by `slug()` in `scripts/content.ts`. Never write a path in
content. After adding words, run `make generate-audio` on a Mac and commit the `.m4a`
files. A missing clip fails `generate-content`, and so fails the deploy, on purpose.

- **One namespace for everything.** Topic words, scene words and game pairs share it.
  `slug()` folds å/ä/ö, so two different words with the same slug are a build error. Ruled
  out today: `hår` (har), `säng` (sång), `år` (är), `ä`/`å`.
- **Wrong pronunciation** (`banan` read as "the track"): add an override in
  `content/audio/pronounce.md` and redo the one clip with `ARGS=--only=banan`. An override
  ending in the word itself (`en banan`) is a carrier. It is spoken whole, then cut out of
  the audio by `scripts/aiff.ts`, so the clip is still one word. An override for a word no
  content uses is an error.

### Sound effects

Drop the download into `client/static/media/sfx/` and run `make convert-sfx` (64 kbps;
speech uses 24). The source is deleted, and `generate-content` refuses to run while one is
left behind. Reference effects from a `## Sounds` section.

`content/games/ui-sounds.md` maps the fixed roles `tap`, `correct` and `fanfare` to sfx
files. A role listed twice gives random variants. They play quietly through one shared
element in `core/sfx.ts`. Never put an effect on a button that already plays a word.

### Runtime speech

`speechSynthesis` is not for anything a child learns: the voice differs per device. Only
`/dev/voices` uses it. It is for disposable runtime text ("Bra! Fem ord!") and never
directly after Alva's clips. Gotchas: `getVoices()` is `[]` until `voiceschanged` fires,
and iOS needs a user gesture.

### Seasons and högtider

`SEASON_IDS` and `EVENT_IDS` (client-only, in `client/src/data/pages.ts`) decide which
pages get `SeasonWheel` or `YearTimeline` in place of the hero emoji. Don't link between two
pages in the same diagram; the diagram already does that. Adding a högtid needs a content
file with `when:`, an `EVENT_IDS` entry in year order, and a colour in `YearTimeline.tsx`'s
`COLORS`.

### Games

Games are routes, listed in `client/src/data/games.ts`, switched in `App.tsx`, and named in
`RESERVED_IDS` and `LINKABLE_ROUTES` (`scripts/content.ts`). They have no score and send
nothing to the server. Every list in `content/games/` explains its own format at the top.

- **Pair lists** are `swedish | english | icon`, sampled at random: `connect-pairs.md`,
  `cooking.md`, `dishes.md`, `kitchen.md`, `shop.md`, `hotel.md`. The icon is an id in
  `client/src/GameIcons/iconIds.ts` or `color-<name>`. An unknown id fails the build. Read
  `client/src/GameIcons/CLAUDE.md` before drawing an icon.
- **`travel.md`** adds `latitude,longitude`. The map projects real coordinates, and the
  sticker icon must be a pair in `connect-pairs.md`, which is where its word comes from.
- **`words.md`** holds what the games *say* with no picture: numbers, "hur många", "kronor",
  "rum". The keys a game uses are in `GAME_WORD_KEYS` (`scripts/gameContent.ts`) and are
  generated as `GAME_WORDS`, so a typo is a `tsc` error.
- **`phrases.md`** holds the celebration lines (no audio).

The newer games (`CountGame`, `ShopGame`, `HotelGame`, `TravelGame`) share `GameFrame`
(title, back button, `Celebration` overlay) and `core/useSpeaker` (clips in order, cut off
by the next tap). Start a new game from those. Each game teaches through its first tap
rather than through instructions: a question is spoken, and a wrong answer says what was
picked. `GAME_COLORS` is deliberately separate from avatar `COLORS`, which are stored in
profiles.

## The dev area

`/dev` opens by tapping the `build …` footer five times within 1.5 s. There is no link,
because the users are children. It renders before the loading and error branches in
`App.tsx` and needs no profile. Add a tool as a component in `client/src/Dev/` plus one
entry in `TOOLS` (`DevPage.tsx`).

## Do not

- Add `setInterval` or any background timer, or cache identity/sessions in module scope.
  Deno Deploy isolates are reclaimed when idle, so anything periodic must be
  request-triggered.
- Write a plain number to a key that `sum` mutates. It must stay `Deno.KvU64`.
- Combine an unscoped `--allow-read` with a scoped `--allow-write` in a task that opens KV
  (`NotCapable: Requires write access`). Scope both, or use `-A`.
- Narrow the client watcher's `--allow-sys` in `api/main.ts`. lightningcss needs
  `os.cpus()`. Without it the watcher dies silently and the old bundle keeps being served;
  the only sign is a `client watcher exited` log line.
