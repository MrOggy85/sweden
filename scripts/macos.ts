// `say`/`afconvert`/`afplay` exist on macOS only, so exit early rather than failing
// halfway through.

export function requireMacos(script: string): void {
  if (Deno.build.os === 'darwin') return;
  console.error(`${script} needs macOS (\`say\` + \`afconvert\`); this is ${Deno.build.os}.`);
  Deno.exit(1);
}

export async function run(cmd: string, args: string[]): Promise<void> {
  const { success, stderr } = await new Deno.Command(cmd, { args, stderr: 'piped' }).output();
  if (!success) throw new Error(`${cmd} failed: ${new TextDecoder().decode(stderr).trim()}`);
}
