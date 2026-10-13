import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ONE_CASH } from "@chw3/engine";
import { computeNav, navInputsFromJson } from "../src/engine-adapter.ts";
import { buildServer, type ServerDeps } from "../src/app.ts";
import { createStore } from "../src/store.ts";
import type { ServerConfig } from "../src/routes/config.ts";

export const TEST_FUND = "0x3333333333333333333333333333333333333333" as const;
export const NAV_105 = 105n * ONE_CASH;

// The fund administrator fixture of the engine gives a NAV of 105.000000
const NAV_INPUTS = navInputsFromJson(JSON.parse(readFileSync(new URL("../../../packages/engine/fixtures/nav-fund-f.json", import.meta.url), "utf8")));

export function testConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    funds: [{ name: "Fund F", address: TEST_FUND }],
    participants: [],
    navInputs: NAV_INPUTS,
    navPerUnit: computeNav(NAV_INPUTS),
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
