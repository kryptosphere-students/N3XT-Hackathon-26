import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { buildServer } from "../src/app.ts";
import { createStore } from "../src/store.ts";

// Fresh store and server per test. Keys are random, in memory only.
export function testServer() {
  const store = createStore(mkdtempSync(join(tmpdir(), "chw3-store-")));
  return buildServer(store);
}

export function testAccount() {
  return privateKeyToAccount(generatePrivateKey());
}
