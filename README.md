# sweden

An interactive web experience for kids to learn about Sweden.

- `client/` — React frontend bundled by esbuild with CSS modules
- `api/` — Deno web server (`Deno.serve`) + Deno KV

See `PROJECT.md` for the design contract and `CLAUDE.md` for conventions.

## Development

```sh
make install
make dev
```

The Deno server runs on `:8777` and spawns the esbuild watcher, which writes bundle output
to `api/client/`. KV is a local SQLite file at `api/.data/kv.sqlite3`.

```sh
make check    # deno check + tsc --noEmit
make fmt
```

## Audio

Words under a `## Words` heading in `content/*.md` get a tappable pronunciation clip.
The clips are prerecorded and committed, not generated at runtime:

```sh
make generate-audio                  # macOS only — say + afconvert -> client/static/media/*.m4a
make generate-audio ARGS=--force     # existing clips are skipped without this
make audio-variants WORD=tack        # size one word at 64/48/32/24/16 kbps before changing settings
```

Clips are mono 22.05 kHz AAC at 24 kbps, about 3 KB each: 64, 32, 24 and 16 kbps were
indistinguishable on a single word. Generation also strips the ~3 KB `free` padding box
afconvert writes, which costs more than the bitrate does at this length.

`content/sentence.md` uses the same clips for the sentence builder — tap words into a box,
press Speak, hear them in order. Adding a word there is a content row plus a clip.

`make generate-content` fails if a word has no clip, so a forgotten run breaks the build
rather than shipping a silent button. See the Sound section of `PROJECT.md`.

## Build

```sh
make build
```

## Deploy

Deno Deploy, manually. Install `deployctl` once:

```sh
deno install -gArf jsr:@deno/deployctl
```

Then:

```sh
make deploy
```

That builds the client and runs, from inside `api/`:

```sh
deployctl deploy --project=sweden --entrypoint=main.ts --include=. --prod
```

Two details that matter:

- **`--include=.` is required.** The built client is not part of the module graph, so
  without it `api/client/out.js` and `index.html` are simply absent from the upload and
  every route 404s. `api/client/` is also gitignored, which is the other reason deployctl
  would skip it. Check the file list deployctl prints.
- **Deploy from `api/`, not the repo root**, so that the uploaded tree's root is `api/`.
  `CLIENT_ROOT` can override the static root if you need to deploy differently.

If instead you build on Deno Deploy (git integration, root directory `api/`), set the
build command to:

```sh
deno task build
```

That task lives in `api/deno.json`, so the command stays in the repo. It must start with
`scripts/generate-content.ts`: `content.generated.ts` and `pages.generated.ts` are
gitignored, so on a fresh checkout the esbuild bundle fails with
`Could not resolve "./pages.generated"` and the server has no `PAGE_IDS`.

After deploying, confirm KV is bound before trusting anything else:

```sh
curl -s https://sweden.deno.dev/api/health    # {"ok":true,"kv":true,"pageIds":8}
```

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8777` | listen port |
| `HOST` | `0.0.0.0` | listen host |
| `DEV` | unset | `1` spawns the client watcher and drops `Secure` from the cookie |
| `KV_PATH` | unset | local SQLite path; ignored on Deno Deploy |
| `CLIENT_ROOT` | resolved from `api/server.ts` | static file root |

## Credits

The favicon and home-screen icon are derived from the Swedish flag emoji in
[Twemoji](https://github.com/twitter/twemoji) (`1f1f8-1f1ea.svg`, v14.0.2), © Twitter, Inc
and other contributors, licensed [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
CC-BY requires this attribution to be kept.
