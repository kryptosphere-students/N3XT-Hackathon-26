// Shared by demo-local.mjs and screenshots.mjs: anvil, deploy, server, web.
// No key is written anywhere: anvil prints its own accounts at start.
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "..");
const CONTRACTS_DIR = resolve(ROOT, "contracts");
const START_TIMEOUT_MS = 30_000;

export async function startLocalStack({ anvilPort = 8545, serverPort = 8787, webPort = 5173, participants, storeDir, log = console.log, env = {} }) {
  const rpcUrl = `http://127.0.0.1:${anvilPort}`;
  const children = [];
  // npm spawns tsx and vite as grandchildren: kill the whole tree, child.kill() is not enough on Windows.
  const stop = () => {
    for (const child of children) {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { shell: true, stdio: "ignore" });
      else child.kill();
    }
    spawnSync("taskkill", ["/F", "/IM", "anvil.exe"], { shell: true, stdio: "ignore" });
  };
  for (const port of [anvilPort, serverPort, webPort]) await assertFree(port);

  // 1. anvil, and its printed accounts
  const anvil = spawn("anvil", ["--port", String(anvilPort)], { shell: true, stdio: ["ignore", "pipe", "inherit"] });
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
  });
  const accounts = [...banner.split("Private Keys")[0].matchAll(/\(\d+\) (0x[0-9a-fA-F]{40})/g)].map((m) => m[1]);
  const keys = [...(banner.split("Private Keys")[1] ?? "").matchAll(/\(\d+\) (0x[0-9a-f]{64})/g)].map((m) => m[1]);
  const [deployer, engine] = accounts;
  const [, engineKey] = keys;
  log(`[stack] anvil up, fund and deployer ${deployer}, engine ${engine}`);

  // 2. deploy, participants whitelisted and prefunded
  // participants: three addresses, or a function of the anvil accounts (screenshots)
  const [a, b, c] = typeof participants === "function" ? participants(accounts) : participants;
  const deploy = spawnSync("forge", ["script", "script/Deploy.s.sol", "--rpc-url", rpcUrl, "--broadcast", "--unlocked", "--sender", deployer], {
    cwd: CONTRACTS_DIR,
    shell: true,
    encoding: "utf8",
    env: { ...process.env, AGENT_PUBLIC_KEY: engine, DEPLOYER_PRIVATE_KEY: "", FUND_ADDRESS: "", PARTICIPANT_A_ADDRESS: a ?? "", PARTICIPANT_B_ADDRESS: b ?? "", PARTICIPANT_C_ADDRESS: c ?? "" },
  });
  if (deploy.status !== 0) {
    stop();
    throw new Error(`forge script failed:\n${deploy.stdout}\n${deploy.stderr}`);
  }
  const pick = (name) => deploy.stdout.match(new RegExp(`${name}=(0x[0-9a-fA-F]{40})`))?.[1];
  const addresses = { SHARE_TOKEN_ADDRESS: pick("SHARE_TOKEN_ADDRESS"), CASH_TOKEN_ADDRESS: pick("CASH_TOKEN_ADDRESS"), ESCROW_ADDRESS: pick("ESCROW_ADDRESS") };
  log(`[stack] deployed ${JSON.stringify(addresses)}`);

  // 3. server and web. Variables set here win over .env.
  const stackEnv = {
    ...env,
    ...addresses,
    RPC_URL: rpcUrl,
    CHAIN_ID: "31337",
    AGENT_PRIVATE_KEY: engineKey,
    AGENT_PUBLIC_KEY: engine,
    FUND_ADDRESS: deployer,
    PARTICIPANT_A_ADDRESS: a ?? "",
    PARTICIPANT_B_ADDRESS: b ?? "",
    PARTICIPANT_C_ADDRESS: c ?? "",
    SERVER_PORT: String(serverPort),
    STORE_DIR: storeDir,
    VITE_SERVER_URL: `http://localhost:${serverPort}`,
    VITE_CHAIN_ID: "31337",
    VITE_ESCROW_ADDRESS: addresses.ESCROW_ADDRESS,
  };
  const run = (name, args) => {
    const child = spawn("npm", args, { cwd: ROOT, env: { ...process.env, ...stackEnv }, shell: true, stdio: ["ignore", "pipe", "inherit"] });
    child.stdout.on("data", (chunk) => log(`[${name}] ${chunk.toString().trimEnd()}`));
    children.push(child);
  };
  run("server", ["run", "dev", "-w", "apps/server"]);
  run("web", ["run", "dev", "-w", "apps/web", "--", "--port", String(webPort), "--strictPort"]);

  const serverUrl = `http://localhost:${serverPort}`;
  const webUrl = `http://localhost:${webPort}`;
  await waitFor(`${serverUrl}/health`);
  await waitFor(webUrl);
  return { accounts, keys, addresses, deployer, engine, serverUrl, webUrl, stop };
}

// A leftover server from an earlier run would answer in place of this one.
async function assertFree(port) {
  try {
    await fetch(`http://127.0.0.1:${port}/`);
  } catch {
    return;
  }
  throw new Error(`port ${port} is already in use, stop the other process first`);
}

async function waitFor(url) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} did not answer`);
}
