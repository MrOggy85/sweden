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

const STATIC_POLL_MS = 2000;

/** static/ as path:size:mtime — cheap at a few dozen files. */
async function staticSignature(dir = 'static'): Promise<string> {
  const parts: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) parts.push(await staticSignature(path));
    else if (entry.isFile) {
      const info = await Deno.stat(path);
      parts.push(`${path}:${info.size}:${info.mtime?.getTime() ?? 0}`);
    }
  }
  return parts.sort().join('|');
}

// Polled, not Deno.watchFs: clips are generated on the host, and inotify events do not
// cross a container bind mount. A watch looks like it works and misses every real change.
async function pollStatic() {
  let previous = await staticSignature();
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, STATIC_POLL_MS));
    const current = await staticSignature();
    if (current === previous) continue;
    previous = current;
    await copyStatic();
    console.log('[build-watch] static changed, copied');
  }
}

async function main() {
  let ctx = await createContext();
  ctx.watch();
  void pollStatic();

  let debounceTimer: number | undefined;

  console.log('[build-watch] watching ./src, polling ./static');
  const watcher = Deno.watchFs('./src', { recursive: true });
  for await (const event of watcher) {
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
