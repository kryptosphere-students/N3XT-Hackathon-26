import Fastify from "fastify";
import { ENGINE_VERSION } from "@chw3/engine";

export function buildServer() {
  const app = Fastify();
  app.get("/health", async () => ({ ok: true, engine: ENGINE_VERSION }));
  return app;
}
