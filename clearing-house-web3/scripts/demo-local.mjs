// npm run demo:local
// Starts anvil, deploys the contracts with the Flex addresses of .env whitelisted
// and prefunded, then starts the server and the web app against that chain.
// Ctrl+C stops everything. No key is written anywhere: anvil prints its own.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_FILE = resolve(ROOT, ".env");
const CONTRACTS_DIR = resolve(ROOT, "contracts");
const ANVIL_PORT = 8545;
const RPC_URL = `http://127.0.0.1:${ANVIL_PORT}`;
const CHAIN_ID = "31337";
const STORE_DIR = resolve(ROOT, "data/store-local");
const START_TIMEOUT_MS = 30_000;

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const children = [];
function stopAll() {
  for (const child of children) child.kill();
  spawnSync("taskkill", ["/F", "/IM", "anvil.exe"], { shell: true, stdio: "ignore" });
  process.exit(0);
}
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

function run(name, command, args, env, cwd = ROOT) {
  const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, shell: true, stdio: ["ignore", "pipe", "inherit"] });
  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  children.push(child);
  return child;
}

// 1. anvil, and its printed accounts
const anvil = spawn("anvil", ["--port", String(ANVIL_PORT)], { shell: true, stdio: ["ignore", "pipe", "inherit"] });
children.push(anvil);
let banner = "";
await new Promise((done, fail) => {
  const timer = setTimeout(() => fail(new Error("anvil did not start, is foundry installed?")), START_TIMEOUT_MS);
  anvil.stdout.on("data", (chunk) => {
    banner += chunk.toString();
    if (banner.includes("Listening on")) {
      clearTimeout(timer);
      done();
    }
  });
}).catch((error) => {
  console.error(error.message);
  stopAll();
});
const accounts = [...banner.split("Private Keys")[0].matchAll(/\(\d+\) (0x[0-9a-fA-F]{40})/g)].map((m) => m[1]);
const keys = [...(banner.split("Private Keys")[1] ?? "").matchAll(/\(\d+\) (0x[0-9a-f]{64})/g)].map((m) => m[1]);
const [deployer, engine] = accounts;
const [, engineKey] = keys;
console.log(`[demo] anvil up, fund and deployer ${deployer}, engine ${engine}`);

// 2. deploy with the Flex addresses from .env
const participants = ["PARTICIPANT_A_ADDRESS", "PARTICIPANT_B_ADDRESS", "PARTICIPANT_C_ADDRESS"].map((name) => process.env[name] ?? "");
if (participants.some((p) => !p)) console.warn("[demo] a PARTICIPANT_*_ADDRESS is empty in .env: that account will be skipped");
const deploy = spawnSync("forge", ["script", "script/Deploy.s.sol", "--rpc-url", RPC_URL, "--broadcast", "--unlocked", "--sender", deployer], {
  cwd: CONTRACTS_DIR,
  shell: true,
  encoding: "utf8",
  env: { ...process.env, AGENT_PUBLIC_KEY: engine, DEPLOYER_PRIVATE_KEY: "", FUND_ADDRESS: "" },
});
if (deploy.status !== 0) {
  console.error(deploy.stdout, deploy.stderr);
  stopAll();
}
const pick = (name) => deploy.stdout.match(new RegExp(`${name}=(0x[0-9a-fA-F]{40})`))?.[1];
const addresses = { SHARE_TOKEN_ADDRESS: pick("SHARE_TOKEN_ADDRESS"), CASH_TOKEN_ADDRESS: pick("CASH_TOKEN_ADDRESS"), ESCROW_ADDRESS: pick("ESCROW_ADDRESS") };
console.log(`[demo] deployed`, addresses);

// 3. server and web against anvil. Variables set here win over .env.
const chainEnv = {
  ...addresses,
  RPC_URL,
  CHAIN_ID,
  AGENT_PRIVATE_KEY: engineKey,
  AGENT_PUBLIC_KEY: engine,
  FUND_ADDRESS: deployer,
  STORE_DIR,
  VITE_CHAIN_ID: CHAIN_ID,
  VITE_ESCROW_ADDRESS: addresses.ESCROW_ADDRESS,
};
run("server", "npm", ["run", "dev", "-w", "apps/server"], chainEnv);
run("web", "npm", ["run", "dev", "-w", "apps/web"], chainEnv);
console.log("[demo] server on http://localhost:8787, web on http://localhost:5173 (Chrome, Ledger Wallet closed). Ctrl+C to stop.");
