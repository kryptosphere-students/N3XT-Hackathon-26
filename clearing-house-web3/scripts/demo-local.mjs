// npm run demo:local
// Starts anvil, deploys the contracts with the Flex addresses of .env whitelisted
// and prefunded, then starts the server and the web app against that chain.
// Ctrl+C stops everything.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, startLocalStack } from "./local-stack.mjs";

const ENV_FILE = resolve(ROOT, ".env");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const participants = ["PARTICIPANT_A_ADDRESS", "PARTICIPANT_B_ADDRESS", "PARTICIPANT_C_ADDRESS"].map((name) => process.env[name] ?? "");
if (participants.some((p) => !p)) console.warn("[demo] a PARTICIPANT_*_ADDRESS is empty in .env: that account will be skipped");

const stack = await startLocalStack({ participants, storeDir: resolve(ROOT, "data/store-local") });
process.on("SIGINT", () => {
  stack.stop();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stack.stop();
  process.exit(0);
});
console.log(`[demo] server on ${stack.serverUrl}, web on ${stack.webUrl} (Chrome, Ledger Wallet closed). Ctrl+C to stop.`);
