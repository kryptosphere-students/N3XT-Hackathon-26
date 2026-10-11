import { buildServer } from "./app.ts";
import { createStore } from "./store.ts";

const DEFAULT_PORT = 8787;
const DEFAULT_STORE_DIR = "data/store";

const port = Number(process.env.SERVER_PORT ?? DEFAULT_PORT);
const store = createStore(process.env.STORE_DIR ?? DEFAULT_STORE_DIR);
await buildServer(store).listen({ port });
console.log(`server listening on http://localhost:${port}`);
