import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { buildServer } from "./app.ts";
import { createStore } from "./store.ts";
import { configFromEnv } from "./routes/config.ts";

const DEFAULT_PORT = 8787;

// Paths are relative to clearing-house-web3/, whatever the current directory.
const ROOT = resolve(import.meta.dirname, "../../..");
const ENV_FILE = resolve(ROOT, ".env");
const DEFAULT_STORE_DIR = resolve(ROOT, "data/store");

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const port = Number(process.env.SERVER_PORT ?? DEFAULT_PORT);
const store = createStore(process.env.STORE_DIR ?? DEFAULT_STORE_DIR);
await buildServer(store, configFromEnv(process.env)).listen({ port });
console.log(`server listening on http://localhost:${port}`);
