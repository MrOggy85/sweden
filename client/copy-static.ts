// Copies client/static/** into api/client/, preserving subdirectories.
//
// Shared by build.ts and build-watch.ts. Both used to copy top-level files only, which
// silently skipped static/media/ — the audio clips would 404 in production with nothing in
// the build output to explain why.
export async function copyStatic(src = 'static', dest = '../api/client'): Promise<void> {
  await Deno.mkdir(dest, { recursive: true });
  for await (const entry of Deno.readDir(src)) {
    if (entry.isDirectory) await copyStatic(`${src}/${entry.name}`, `${dest}/${entry.name}`);
    else if (entry.isFile) await Deno.copyFile(`${src}/${entry.name}`, `${dest}/${entry.name}`);
  }
}
