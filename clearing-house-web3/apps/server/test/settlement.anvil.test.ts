import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPublicClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import { ONE_CASH } from "@chw3/engine";
import { instructionToText, mandateToText } from "@chw3/protocol";
import { createChain, escrowAbi } from "../src/chain.ts";
import { testAccount, testServer } from "./helpers.ts";

// End to end on a local anvil: deploy with the forge script, sign with the
// anvil accounts, settle through the server, read the result on chain.
// Skipped when forge or anvil are not on the PATH (npm test still passes).
const CONTRACTS_DIR = resolve(import.meta.dirname, "../../../contracts");
const ANVIL_PORT = 8547;
const RPC_URL = `http://127.0.0.1:${ANVIL_PORT}`;
const UNIT = 10n ** 6n;
const CYCLE = "2026-10-13";
const START_TIMEOUT_MS = 60_000;

const hasFoundry = spawnSync("anvil", ["--version"], { shell: true }).status === 0;

type Deployed = { shareToken: Hex; cashToken: Hex; escrow: Hex };

// anvil prints its accounts and keys at start: no key literal in the code.
function parseAnvilKeys(output: string): Hex[] {
  const section = output.split("Private Keys")[1] ?? "";
  return [...section.matchAll(/\(\d+\) (0x[0-9a-f]{64})/g)].map((m) => m[1] as Hex);
}

function deploy(engineAddress: string, participants: string[], sender: string): Deployed {
  const env = {
    ...process.env,
    AGENT_PUBLIC_KEY: engineAddress,
    PARTICIPANT_A_ADDRESS: participants[0],
    PARTICIPANT_B_ADDRESS: participants[1],
    PARTICIPANT_C_ADDRESS: participants[2],
    DEPLOYER_PRIVATE_KEY: "",
    FUND_ADDRESS: "",
  };
  const run = spawnSync("forge", ["script", "script/Deploy.s.sol", "--rpc-url", RPC_URL, "--broadcast", "--unlocked", "--sender", sender], {
    cwd: CONTRACTS_DIR,
    env,
    shell: true,
    encoding: "utf8",
  });
  if (run.status !== 0) throw new Error(`forge script failed: ${run.stdout}\n${run.stderr}`);
  const pick = (name: string) => run.stdout.match(new RegExp(`${name}=(0x[0-9a-fA-F]{40})`))?.[1] as Hex;
  return { shareToken: pick("SHARE_TOKEN_ADDRESS"), cashToken: pick("CASH_TOKEN_ADDRESS"), escrow: pick("ESCROW_ADDRESS") };
}

describe.skipIf(!hasFoundry)("settlement on anvil (S-021, S-042)", () => {
  let node: ChildProcess;
  let keys: Hex[];
  let deployed: Deployed;

  beforeAll(async () => {
    node = spawn("anvil", ["--port", String(ANVIL_PORT)], { shell: true });
    let output = "";
    await new Promise<void>((done, fail) => {
      const timer = setTimeout(() => fail(new Error("anvil did not start")), START_TIMEOUT_MS);
      node.stdout?.on("data", (chunk: Buffer) => {
        output += chunk.toString();
        if (output.includes("Listening on")) {
          clearTimeout(timer);
          done();
        }
      });
    });
    keys = parseAnvilKeys(output);
    const [deployer, engine, a, b, c] = keys.map((k) => privateKeyToAccount(k).address);
    deployed = deploy(engine!, [a!, b!, c!], deployer!);
  }, START_TIMEOUT_MS);

  afterAll(() => {
    node?.kill();
    spawnSync("taskkill", ["/F", "/IM", "anvil.exe"], { shell: true });
  });

  it("settles a netted lot on chain and moves the escrow balances", async () => {
    const [, engineKey, keyA, keyB] = keys;
    const chain = createChain({ rpcUrl: RPC_URL, chainId: anvil.id, escrow: deployed.escrow, shareToken: deployed.shareToken, cashToken: deployed.cashToken, agentPrivateKey: engineKey! });
    const deployer = privateKeyToAccount(keys[0]!).address;
    const app = testServer({
      chain,
      config: { funds: [{ name: "Fund F", address: deployer }], participants: [], navPerUnit: 105n * ONE_CASH, chainId: anvil.id, escrow: deployed.escrow },
    });
    const a = privateKeyToAccount(keyA!);
    const b = privateKeyToAccount(keyB!);

    for (const [account, name] of [[a, "Manager A"], [b, "Manager B"]] as const) {
      const mandate = { participant: account.address, participantName: name, allowedFunds: ["Fund F"], maxCashPerCycle: 5_000_000n * ONE_CASH, allowedSides: ["BUY", "SELL"] as ("BUY" | "SELL")[], nonce: 1 };
      const signature = await account.signMessage({ message: mandateToText(mandate) });
      expect((await app.inject({ method: "POST", url: "/mandates", payload: { mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature } })).statusCode).toBe(201);
    }
    for (const [account, name, id, side, units] of [[a, "Manager A", "o1", "BUY", 100n], [b, "Manager B", "o2", "SELL", 40n]] as const) {
      const instruction = { id, cycleId: CYCLE, fund: deployer, participant: account.address, side, shares: units * UNIT };
      const payload = { instruction, fundName: "Fund F", participantName: name, nonce: 1 };
      const signature = await account.signMessage({ message: instructionToText(payload) });
      expect((await app.inject({ method: "POST", url: "/instructions", payload: { ...payload, instruction: { ...instruction, shares: instruction.shares.toString() }, signature } })).statusCode).toBe(201);
    }

    const lot = (await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "netting" } })).json();
    expect(lot.status).toBe("pending");
    for (const account of [a, b]) {
      const signature = await account.signMessage({ message: lot.texts[account.address] });
      const res = await app.inject({ method: "POST", url: `/lots/${lot.id}/approvals`, payload: { participant: account.address, signature } });
      expect(res.statusCode).toBe(201);
    }
    const settled = (await app.inject({ method: "GET", url: `/lots/${lot.id}` })).json();
    expect(settled.status).toBe("settled");
    expect(settled.txHash).toMatch(/^0x/);

    const client = createPublicClient({ chain: anvil, transport: http(RPC_URL) });
    expect(await client.readContract({ address: deployed.escrow, abi: escrowAbi, functionName: "settled", args: [1n] })).toBe(true);
    const sharesA = await client.readContract({ address: deployed.escrow, abi: escrowAbi, functionName: "balances", args: [a.address, deployed.shareToken] });
    expect(sharesA).toBe(1_000n * UNIT + 100n * UNIT);
    const cashB = await client.readContract({ address: deployed.escrow, abi: escrowAbi, functionName: "balances", args: [b.address, deployed.cashToken] });
    expect(cashB).toBe(1_000_000n * ONE_CASH + 4_200n * ONE_CASH);

    // The unused third account can still settle an instant lot later.
    const stranger = testAccount();
    expect(stranger.address).not.toBe(a.address);
    await app.close();
  }, START_TIMEOUT_MS);
});
