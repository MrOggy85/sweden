// Recursive: a top-level-only copy silently skipped media/ and 404'd in production.
export async function copyStatic(src = 'static', dest = '../api/client'): Promise<void> {
  await Deno.mkdir(dest, { recursive: true });
  for await (const entry of Deno.readDir(src)) {
    // macOS drops .DS_Store into any folder Finder opens; it would otherwise deploy.
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory) await copyStatic(`${src}/${entry.name}`, `${dest}/${entry.name}`);
    else if (entry.isFile) await Deno.copyFile(`${src}/${entry.name}`, `${dest}/${entry.name}`);
  }
}
