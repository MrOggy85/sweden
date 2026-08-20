.PHONY: install dev build check fmt deploy

# Install the client's npm dependencies (react, esbuild). The api has none.
install:
	npm --prefix client install

# Start everything: the Deno server on :8777, which spawns the esbuild watcher.
dev:
	deno task --cwd api dev

# Production build: bundle the client into api/client/.
build:
	npm --prefix client run build

check:
	deno task --cwd api check
	npm --prefix client run check

fmt:
	deno fmt --config api/deno.json api
	deno fmt --config client/deno.json client

# Deploy from inside api/ so that Deno.cwd() on Deno Deploy is the api root.
# --include=. is required: the built client is not in the module graph.
deploy: build
	cd api && deployctl deploy --project=sweden --entrypoint=main.ts --include=. --prod
