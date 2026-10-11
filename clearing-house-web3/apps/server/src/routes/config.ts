import type { FastifyInstance } from "fastify";
import { zeroAddress, type Address } from "viem";

// What the browser needs and may know: no secrets here.
export type ServerConfig = { funds: { name: string; address: Address }[] };

export const FUND_F_NAME = "Fund F";

export function configFromEnv(env: NodeJS.ProcessEnv): ServerConfig {
  return { funds: [{ name: FUND_F_NAME, address: (env.FUND_ADDRESS as Address) || zeroAddress }] };
}

export function registerConfigRoutes(app: FastifyInstance, config: ServerConfig) {
  app.get("/config", async () => config);
}
