import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ENCRYPTED_KEY_FILE, loadAgentKey, quoteArg, runCommand, type Runner } from "../src/agents/secret.ts";

// Random test values, nothing real.
const ENV_KEY = "env-key-for-tests";
const RING_KEY = "ring-key-for-tests";

function rootWithEncryptedFile(): string {
  const root = mkdtempSync(join(tmpdir(), "chw3-secret-"));
  mkdirSync(join(root, "secrets"));
  writeFileSync(join(root, ENCRYPTED_KEY_FILE), "ciphertext");
  return root;
}

describe("agent key through Ledger Key Ring (S-023)", () => {
  it("falls back to .env when there is no encrypted file", () => {
    const root = mkdtempSync(join(tmpdir(), "chw3-secret-"));
    const result = loadAgentKey({ OPENROUTER_API_KEY: ENV_KEY }, root, () => {
      throw new Error("must not run wallet-cli");
    });
    expect(result).toEqual({ key: ENV_KEY, source: "env", note: "plain .env (fallback)" });
  });

  it("falls back and says why when WALLET_PASS is missing", () => {
    const result = loadAgentKey({ OPENROUTER_API_KEY: ENV_KEY }, rootWithEncryptedFile(), () => {
      throw new Error("must not run wallet-cli");
    });
    expect(result.source).toBe("env");
    expect(result.note).toContain("WALLET_PASS is not set");
  });

  it("runs wallet-cli ring decrypt with the key name and reads the output file", () => {
    const root = rootWithEncryptedFile();
    const calls: { command: string; args: string[] }[] = [];
    const runner: Runner = (command, args, env) => {
      calls.push({ command, args });
      expect(env.WALLET_PASS).toBe("secret-from-terminal");
      writeFileSync(args[args.indexOf("-o") + 1]!, RING_KEY + "\n");
      return { status: 0, stderr: "" };
    };
    const result = loadAgentKey({ OPENROUTER_API_KEY: ENV_KEY, WALLET_PASS: "secret-from-terminal", KEY_RING_KEY_NAME: "demo-key" }, root, runner);
    expect(result).toEqual({ key: RING_KEY, source: "key-ring", note: "decrypted with Ledger Key Ring" });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.command).toBe("wallet-cli");
    expect(calls[0]!.args.slice(0, 4)).toEqual(["ring", "decrypt", "--key", "demo-key"]);
    expect(calls[0]!.args).toContain(join(root, ENCRYPTED_KEY_FILE));
    // The key itself never appears in the note (what gets logged).
    expect(result.note).not.toContain(RING_KEY);
  });

  it("falls back when the decryption fails", () => {
    const result = loadAgentKey({ OPENROUTER_API_KEY: ENV_KEY, WALLET_PASS: "x" }, rootWithEncryptedFile(), () => ({ status: 1, stderr: "wrong password" }));
    expect(result.source).toBe("env");
    expect(result.note).toContain("ring decrypt failed (wrong password)");
  });

  it("answers none when nothing is available", () => {
    const root = mkdtempSync(join(tmpdir(), "chw3-secret-"));
    expect(loadAgentKey({}, root).source).toBe("none");
  });

  it("keeps a path with spaces whole when the command goes through the shell", () => {
    expect(quoteArg(String.raw`D:\N3XT Hackathon\secrets\openrouter.enc`)).toBe(String.raw`"D:\N3XT Hackathon\secrets\openrouter.enc"`);
    expect(quoteArg("clearing-house-config")).toBe("clearing-house-config");

    // Real subprocess: a script in a directory with a space copies its first
    // argument (also with a space) to its second one, like ring decrypt -i/-o.
    const dir = join(mkdtempSync(join(tmpdir(), "chw3-secret-")), "with space");
    mkdirSync(dir);
    const script = join(dir, "copy.cjs");
    writeFileSync(script, 'require("node:fs").copyFileSync(process.argv[2], process.argv[3]);');
    writeFileSync(join(dir, "in.txt"), RING_KEY);
    const run = runCommand("node", [script, join(dir, "in.txt"), join(dir, "out.txt")], process.env);
    expect(run.status).toBe(0);
    expect(readFileSync(join(dir, "out.txt"), "utf8")).toBe(RING_KEY);
  });
});
