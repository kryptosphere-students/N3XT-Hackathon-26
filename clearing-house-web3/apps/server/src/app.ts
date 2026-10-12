import Fastify from "fastify";
import cors from "@fastify/cors";
import { ENGINE_VERSION } from "@chw3/engine";
import type { Store } from "./store.ts";
import type { Chain } from "./chain.ts";
import { registerMandateRoutes } from "./routes/mandates.ts";
import { registerInstructionRoutes } from "./routes/instructions.ts";
import { registerNonceRoutes } from "./routes/nonces.ts";
import { registerConfigRoutes, type ServerConfig } from "./routes/config.ts";
import { registerIntakeRoutes, type IntakeDeps } from "./routes/intake.ts";
import { registerLotRoutes } from "./routes/lots.ts";
import { registerDemoRoutes } from "./routes/demo.ts";

export type ServerDeps = {
  store: Store;
  config: ServerConfig;
  intake?: IntakeDeps | null;
  chain?: Chain | null;
};

export function buildServer({ store, config, intake = null, chain = null }: ServerDeps) {
  const app = Fastify();
  app.register(cors, { origin: true });
  app.get("/health", async () => ({ ok: true, engine: ENGINE_VERSION, chain: chain ? config.chainId : null }));
  registerMandateRoutes(app, store);
  registerInstructionRoutes(app, store, config);
  registerNonceRoutes(app, store);
  registerConfigRoutes(app, config);
  registerIntakeRoutes(app, store, config, intake);
  registerLotRoutes(app, store, config, chain);
  registerDemoRoutes(app);
  return app;
}
