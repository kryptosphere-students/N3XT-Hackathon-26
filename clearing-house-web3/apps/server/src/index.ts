import { buildServer } from "./app.ts";

const DEFAULT_PORT = 8787;

const port = Number(process.env.SERVER_PORT ?? DEFAULT_PORT);
await buildServer().listen({ port });
console.log(`server listening on http://localhost:${port}`);
