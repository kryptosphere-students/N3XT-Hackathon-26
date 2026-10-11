import Fastify from "fastify";
import cors from "@fastify/cors";
import { ENGINE_VERSION } from "@chw3/engine";
import type { Store } from "./store.ts";
import { registerMandateRoutes } from "./routes/mandates.ts";
import { registerInstructionRoutes } from "./routes/instructions.ts";
import { registerNonceRoutes } from "./routes/nonces.ts";

export function buildServer(store: Store) {
  const app = Fastify();
  app.register(cors, { origin: true });
  app.get("/health", async () => ({ ok: true, engine: ENGINE_VERSION }));
  registerMandateRoutes(app, store);
  registerInstructionRoutes(app, store);
  registerNonceRoutes(app, store);
  return app;
}
