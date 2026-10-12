import Fastify from "fastify";
import cors from "@fastify/cors";
import { ENGINE_VERSION } from "@chw3/engine";
import type { Store } from "./store.ts";
import { registerMandateRoutes } from "./routes/mandates.ts";
import { registerInstructionRoutes } from "./routes/instructions.ts";
import { registerNonceRoutes } from "./routes/nonces.ts";
import { registerConfigRoutes, type ServerConfig } from "./routes/config.ts";
import { registerIntakeRoutes, type IntakeDeps } from "./routes/intake.ts";

export function buildServer(store: Store, config: ServerConfig, intake: IntakeDeps | null = null) {
  const app = Fastify();
  app.register(cors, { origin: true });
  app.get("/health", async () => ({ ok: true, engine: ENGINE_VERSION }));
  registerMandateRoutes(app, store);
  registerInstructionRoutes(app, store);
  registerNonceRoutes(app, store);
  registerConfigRoutes(app, config);
  registerIntakeRoutes(app, intake);
  return app;
}
