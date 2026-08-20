// The only place Deno.openKv is called.
//
// Locally KV_PATH points at a SQLite file; on Deno Deploy no path is given and the
// pathless form binds to managed KV. The DENO_DEPLOYMENT_ID guard exists because a
// stray KV_PATH in the Deploy project's env vars would try to open a SQLite file on a
// read-only filesystem and the app would fail to boot.

const ON_DEPLOY = !!Deno.env.get('DENO_DEPLOYMENT_ID');
const KV_PATH = ON_DEPLOY ? undefined : Deno.env.get('KV_PATH');

if (KV_PATH) {
  // KV creates the database file but not its parent directory. SQLite also writes
  // -wal/-shm sidecars, which is why the write permission is granted on the directory.
  const slash = KV_PATH.lastIndexOf('/');
  if (slash > 0) {
    await Deno.mkdir(KV_PATH.slice(0, slash), { recursive: true });
  }
}

const kv = await Deno.openKv(KV_PATH);

export default kv;
