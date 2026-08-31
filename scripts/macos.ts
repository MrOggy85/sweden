// The audio scripts drive macOS' built-in `say`, `afconvert` and `afplay`. Neither Deno
// Deploy nor the Linux dev container has them, so both scripts exit early with a clear
// message rather than failing on a missing binary halfway through.

export function requireMacos(script: string): void {
  if (Deno.build.os === 'darwin') return;
  console.error(`${script} needs macOS (\`say\` + \`afconvert\`); this is ${Deno.build.os}.`);
  Deno.exit(1);
}

export async function run(cmd: string, args: string[]): Promise<void> {
  const { success, stderr } = await new Deno.Command(cmd, { args, stderr: 'piped' }).output();
  if (!success) throw new Error(`${cmd} failed: ${new TextDecoder().decode(stderr).trim()}`);
}
