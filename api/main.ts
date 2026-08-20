import { init } from './server.ts';
import logger from './logger.ts';

const DEV = Deno.env.get('DEV') === '1';
const HOST = Deno.env.get('HOST') || '0.0.0.0';
const PORT = Deno.env.get('PORT') || '8777';

function startClientWatcher() {
  const cmd = new Deno.Command(Deno.execPath(), {
    cwd: '../client',
    args: [
      'run',
      '--allow-env',
      '--allow-read=.',
      '--allow-ffi=./node_modules',
      '--allow-run',
      '--allow-sys=uid',
      '--allow-write=../api/client',
      'build-watch.ts',
    ],
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const child = cmd.spawn();

  (async () => {
    const status = await child.status;
    logger.info('client watcher exited', { status: status.code });
  })();

  return child;
}

if (DEV) {
  const watcher = startClientWatcher();

  addEventListener('SIGINT', () => {
    logger.info('SIGINT received, killing client build script');
    watcher.kill('SIGINT');
    Deno.exit();
  });
}

init(HOST, PORT);

logger.info('server started', { host: HOST, port: PORT });
