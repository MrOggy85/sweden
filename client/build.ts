import cssModulesPlugin from 'npm:esbuild-css-modules-plugin';
import esbuild from 'npm:esbuild';

async function resolveBuildHash(): Promise<string> {
  const envHash = Deno.env.get('BUILD_HASH') || Deno.env.get('GITHUB_SHA');
  if (envHash) return envHash.slice(0, 7);

  try {
    const out = await new Deno.Command('git', {
      args: ['rev-parse', '--short', 'HEAD'],
      stdout: 'piped',
      stderr: 'piped',
    }).output();
    if (out.success) {
      const hash = new TextDecoder().decode(out.stdout).trim();
      if (hash) return hash;
    }
  } catch (_e) {
    // git not available
  }

  return 'dev';
}

const BUILD_HASH = await resolveBuildHash();
console.log('BUILD_HASH:', BUILD_HASH);

// Copy static assets into the api's client folder
await Deno.mkdir('../api/client', { recursive: true });
for await (const entry of Deno.readDir('static')) {
  if (entry.isFile) {
    await Deno.copyFile(`static/${entry.name}`, `../api/client/${entry.name}`);
  }
}

await esbuild.build({
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
    BUILD_HASH: JSON.stringify(BUILD_HASH),
  },
});

// Inject cache-busting query params into index.html
const templatePath = new URL('static/index.html', import.meta.url).pathname;
const outHtmlPath = new URL('../api/client/index.html', import.meta.url).pathname;
let html = await Deno.readTextFile(templatePath);
html = html.replace(/\/(out\.js|out\.css)"/g, `/$1?v=${BUILD_HASH}"`);
await Deno.writeTextFile(outHtmlPath, html);
console.log('Generated index.html with cache-bust:', BUILD_HASH);

esbuild.stop();
