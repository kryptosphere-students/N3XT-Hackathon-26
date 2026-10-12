import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildServer } from "./app.ts";
import { createStore } from "./store.ts";
import { configFromEnv } from "./routes/config.ts";
import { llmConfigFromEnv } from "./agents/config.ts";
import { createLlmClient } from "./agents/llm.ts";
import type { IntakeDeps } from "./routes/intake.ts";

const DEFAULT_PORT = 8787;

// Paths are relative to clearing-house-web3/, whatever the current directory.
const ROOT = resolve(import.meta.dirname, "../../..");
const ENV_FILE = resolve(ROOT, ".env");
const DEFAULT_STORE_DIR = resolve(ROOT, "data/store");

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const port = Number(process.env.SERVER_PORT ?? DEFAULT_PORT);
const store = createStore(process.env.STORE_DIR ?? DEFAULT_STORE_DIR);
const config = configFromEnv(process.env);

// Without a key the server still runs: only POST /intake answers 503.
let intake: IntakeDeps | null = null;
if (process.env.OPENROUTER_API_KEY) {
  const llm = llmConfigFromEnv(process.env);
  intake = {
    client: createLlmClient(llm),
    options: { model: llm.model, fallbackModel: llm.fallbackModel, knownFunds: config.funds.map((f) => f.name), log: console.log },
  };
} else {
  console.log("OPENROUTER_API_KEY missing: POST /intake disabled");
}

await buildServer(store, config, intake).listen({ port });
console.log(`server listening on http://localhost:${port}`);
