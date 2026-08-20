type Fields = Record<string, unknown>;

function emit(level: 'info' | 'error', msg: string, fields?: Fields) {
  const out = JSON.stringify({ level, msg, time: new Date().toISOString(), ...fields });
  if (level === 'error') console.error(out);
  else console.log(out);
}

function serializeError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: String(err) };
}

/** x-forwarded-for is client-controlled, so treat the result as advisory only. */
export function getClientIp(req: Request, fallback: string): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return fallback;
}

export default {
  info: (msg: string, fields?: Fields) => emit('info', msg, fields),
  error: (msg: string, fields?: Fields) => emit('error', msg, fields),
  serializeError,
};
