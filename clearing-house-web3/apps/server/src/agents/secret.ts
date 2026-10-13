import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// S-023: the LLM key is stored encrypted with Ledger Key Ring (wallet-cli ring)
// and decrypted at startup in a subprocess. The ring password comes from
// WALLET_PASS, set by the developer in the terminal, never from .env.
// Without the encrypted file the server falls back to OPENROUTER_API_KEY.

export type AgentKeySource = "key-ring" | "env" | "none";

export type AgentKey = { key: string | null; source: AgentKeySource; note: string };

export const ENCRYPTED_KEY_FILE = "secrets/openrouter.enc";
const DEFAULT_KEY_NAME = "clearing-house-config";

export type Runner = (command: string, args: string[], env: NodeJS.ProcessEnv) => { status: number | null; stderr: string };

// wallet-cli is a .cmd shim on Windows, so it has to go through a shell. With
// shell: true Node joins the arguments with spaces and does not quote them, so a
// repo path with a space (D:\N3XT Hackathon ...) would be cut at that space.
export function quoteArg(arg: string): string {
  return /\s/.test(arg) ? `"${arg}"` : arg;
}

export const runCommand: Runner = (command, args, env) => {
  const line = [command, ...args.map(quoteArg)].join(" ");
  const run = spawnSync(line, { env, shell: true, encoding: "utf8", stdio: ["ignore", "ignore", "pipe"] });
  return { status: run.status, stderr: run.stderr ?? "" };
};

export function loadAgentKey(env: NodeJS.ProcessEnv, root: string, runner: Runner = runCommand): AgentKey {
  const encrypted = join(root, ENCRYPTED_KEY_FILE);
  const fallback = (): AgentKey =>
    env.OPENROUTER_API_KEY
      ? { key: env.OPENROUTER_API_KEY, source: "env", note: "plain .env (fallback)" }
      : { key: null, source: "none", note: "no key: POST /intake disabled" };

  if (!existsSync(encrypted)) return fallback();
  if (!env.WALLET_PASS) {
    const result = fallback();
    return { ...result, note: `${ENCRYPTED_KEY_FILE} found but WALLET_PASS is not set, ${result.note}` };
  }

  // Decrypted to a temporary file and read back: wallet-cli switches to JSON on a
  // piped stdout, and nothing of the clear text must reach a log.
  const dir = mkdtempSync(join(tmpdir(), "chw3-ring-"));
  const out = join(dir, "key");
  try {
    const keyName = env.KEY_RING_KEY_NAME ?? DEFAULT_KEY_NAME;
    const run = runner("wallet-cli", ["ring", "decrypt", "--key", keyName, "-i", encrypted, "-o", out], env);
    if (run.status !== 0 || !existsSync(out)) {
      const result = fallback();
      return { ...result, note: `ring decrypt failed (${run.stderr.trim() || "no output"}), ${result.note}` };
    }
    const key = readFileSync(out, "utf8").trim();
    if (!key) return { ...fallback(), note: "ring decrypt gave an empty key, fallback" };
    return { key, source: "key-ring", note: "decrypted with Ledger Key Ring" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
