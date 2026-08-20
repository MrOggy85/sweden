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
