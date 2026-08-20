#!/bin/bash
set -e

DIR=$(pwd)

deno run \
  --allow-env \
  --allow-read \
  --allow-write=../api/client \
  --allow-ffi="$DIR"/node_modules \
  --allow-run \
  --allow-sys \
  build-watch.ts
