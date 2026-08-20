.PHONY: install dev build check fmt deploy generate-content

# Install the client's npm dependencies (react, esbuild). The api has none.
install:
	npm --prefix client install

# Parse content/*.md into api/db/content.generated.ts and
# client/src/data/pages.generated.ts. Both are gitignored build output; dev/build/check
# below depend on this so you never have to run it by hand.
generate-content:
	deno run --allow-read=content --allow-write=api/db,client/src/data scripts/generate-content.ts

# Start everything: the Deno server on :8777, which spawns the esbuild watcher.
dev: generate-content
	deno task --cwd api dev

# Production build: bundle the client into api/client/.
build: generate-content
	npm --prefix client run build

check: generate-content
	deno task --cwd api check
	npm --prefix client run check

fmt:
	deno fmt --config api/deno.json api scripts
	deno fmt --config client/deno.json client

# Deploy from inside api/ so that Deno.cwd() on Deno Deploy is the api root.
# --include=. is required: the built client is not in the module graph.
deploy: build
	cd api && deployctl deploy --project=sweden --entrypoint=main.ts --include=. --prod
