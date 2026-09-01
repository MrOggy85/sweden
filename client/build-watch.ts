import cssModulesPlugin from 'npm:esbuild-css-modules-plugin';
import esbuild from 'npm:esbuild';
import { copyStatic } from './copy-static.ts';

await copyStatic();

// Write a non-cache-busted index.html for dev so we don't have to rebuild HTML on each change
const indexHtml = await Deno.readTextFile('static/index.html');
await Deno.writeTextFile('../api/client/index.html', indexHtml);

function createContext() {
  return esbuild.context({
    logLevel: 'info',
    entryPoints: ['src/App.tsx'],
    bundle: true,
    outfile: '../api/client/out.js',
    format: 'iife',
    target: ['es2020'],
    platform: 'browser',
    minify: true,
    sourcemap: false,
    plugins: [cssModulesPlugin({})],
    define: {
      BUILD_HASH: '"local"',
    },
  });
}

async function main() {
  let ctx = await createContext();
  ctx.watch();

  let debounceTimer: number | undefined;
  let staticTimer: number | undefined;

  console.log('[build-watch] watching ./src and ./static');
  const watcher = Deno.watchFs(['./src', './static'], { recursive: true });
  for await (const event of watcher) {
    // A new clip from `make generate-audio` lands in static/media/ while this is running.
    // Without re-copying, the server keeps serving whatever was there at startup, and the
    // only symptom is a word that plays nothing.
    if (event.paths.some((p) => p.includes('/static/'))) {
      clearTimeout(staticTimer);
      staticTimer = setTimeout(async () => {
        await copyStatic();
        console.log('[build-watch] static copied:', event.paths.length, 'path(s) changed');
      }, 100);
      continue;
    }

    // esbuild's own watch does not reliably pick up CSS-module changes, so the whole
    // context is torn down and recreated on any .css write.
    if (event.paths.some((p) => p.endsWith('.css'))) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log('[build-watch] CSS changed:', event.paths);
        await ctx.dispose();
        ctx = await createContext();
        ctx.watch();
      }, 100);
    }
  }
}

main().catch(() => Deno.exit(1));
