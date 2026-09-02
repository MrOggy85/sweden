.PHONY: install dev build check fmt deploy generate-content generate-audio audio-variants convert-sfx

# Install the client's npm dependencies (react, esbuild). The api has none.
install:
	npm --prefix client install

# Parse content/*.md into api/db/content.generated.ts and
# client/src/data/pages.generated.ts, and content/games/*.md into
# client/src/data/gameContent.generated.ts. All gitignored build output; dev/build/check
# below depend on this so you never have to run it by hand.
generate-content:
	deno run --allow-read=content,client/static/media --allow-write=api/db,client/src/data scripts/generate-content.ts
	deno run --allow-read=content/games,client/static/media --allow-write=client/src/data scripts/generate-game-content.ts

# Regenerate the pronunciation clips for every `## Words` entry. macOS only (`say` +
# `afconvert`), run by hand: the clips are committed, so build/dev/check do not depend on
# this. Existing clips are skipped; pass script flags through ARGS, e.g.
#   make generate-audio ARGS=--force
#   make generate-audio ARGS=--voice=Klara
generate-audio:
	deno run --allow-read=content,client/static --allow-write=client/static --allow-run=say,afconvert scripts/generate-audio.ts $(ARGS)

# Encode one word at a range of AAC settings and print what each costs, to pick the
# smallest that still sounds right. Writes only to /tmp; nothing here reaches the app.
# macOS only. /tmp is a symlink to /private/tmp, hence both paths.
#   make audio-variants WORD=tack ARGS=--play
audio-variants:
	deno run --allow-read=/tmp,/private/tmp --allow-write=/tmp,/private/tmp --allow-run=say,afconvert,afplay scripts/compare-audio.ts $(WORD) $(ARGS)

# Normalise downloaded sound effects in client/static/media/sfx/ into .m4a. macOS only.
# 64 kbps by default — effects need more than the 24 kbps the speech clips use.
#   make convert-sfx ARGS=--force
#   make convert-sfx ARGS="--bitrate=96000 --mono"
convert-sfx:
	deno run --allow-read=client/static/media/sfx --allow-write=client/static/media/sfx --allow-run=afconvert scripts/convert-sfx.ts $(ARGS)

# Start everything: the Deno server on :8777, which spawns the esbuild watcher.
dev: generate-content
	deno task --cwd api dev

# Production build: bundle the client into api/client/.
build: generate-content
	npm --prefix client run build

check: generate-content
	deno task --cwd api check
	deno check scripts/generate-content.ts scripts/generate-game-content.ts scripts/generate-audio.ts scripts/compare-audio.ts scripts/convert-sfx.ts scripts/mp4.ts
	npm --prefix client run check

fmt:
	deno fmt --config api/deno.json api scripts
	deno fmt --config client/deno.json client

# Deploy from inside api/ so that Deno.cwd() on Deno Deploy is the api root.
# --include=. is required: the built client is not in the module graph.
deploy: build
	cd api && deployctl deploy --project=sweden --entrypoint=main.ts --include=. --prod
