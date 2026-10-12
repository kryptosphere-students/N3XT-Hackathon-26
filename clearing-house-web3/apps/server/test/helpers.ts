import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ONE_CASH } from "@chw3/engine";
import { buildServer, type ServerDeps } from "../src/app.ts";
import { createStore } from "../src/store.ts";
import type { ServerConfig } from "../src/routes/config.ts";

export const TEST_FUND = "0x3333333333333333333333333333333333333333" as const;
export const NAV_105 = 105n * ONE_CASH;

export function testConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    funds: [{ name: "Fund F", address: TEST_FUND }],
    participants: [],
    navPerUnit: NAV_105,
    chainId: 31337,
    escrow: "0x0000000000000000000000000000000000000000",
    agentKeySource: "none",
    ...overrides,
  };
}

// Fresh store and server per test. Keys are random, in memory only.
export function testServer(deps: Partial<ServerDeps> = {}) {
  const store = createStore(mkdtempSync(join(tmpdir(), "chw3-store-")));
  return buildServer({ store, config: testConfig(), ...deps });
}

export function testAccount() {
  return privateKeyToAccount(generatePrivateKey());
}
