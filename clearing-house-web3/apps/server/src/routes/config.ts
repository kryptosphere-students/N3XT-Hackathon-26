import type { FastifyInstance } from "fastify";
import { zeroAddress, type Address } from "viem";
import { ONE_CASH } from "@chw3/engine";
import type { AgentKeySource } from "../agents/secret.ts";

// What the browser needs and may know: no secrets here.
export type Participant = { key: "A" | "B" | "C"; name: string; address: Address };

export type ServerConfig = {
  funds: { name: string; address: Address }[];
  participants: Participant[];
  // Demo NAV until the NAV mock (S-024) lands: cash for one share, 6 decimals
  navPerUnit: bigint;
  chainId: number;
  escrow: Address;
  // Where the LLM key came from at startup: Ledger Key Ring, plain .env, or nothing (S-023)
  agentKeySource: AgentKeySource;
};

export const FUND_F_NAME = "Fund F";
const DEMO_NAV_PER_UNIT = 105n * ONE_CASH;
const DEFAULT_CHAIN_ID = 84532;

export function configFromEnv(env: NodeJS.ProcessEnv, agentKeySource: AgentKeySource = "none"): ServerConfig {
  const fund = (env.FUND_ADDRESS || env.DEPLOYER_PUBLIC_KEY || zeroAddress) as Address;
  return {
    funds: [{ name: FUND_F_NAME, address: fund }],
    participants: [
      { key: "A", name: "Manager A", address: (env.PARTICIPANT_A_ADDRESS || zeroAddress) as Address },
      { key: "B", name: "Manager B", address: (env.PARTICIPANT_B_ADDRESS || zeroAddress) as Address },
      { key: "C", name: "Depositary C", address: (env.PARTICIPANT_C_ADDRESS || zeroAddress) as Address },
    ],
    navPerUnit: env.NAV_PER_UNIT ? BigInt(env.NAV_PER_UNIT) : DEMO_NAV_PER_UNIT,
    chainId: Number(env.CHAIN_ID ?? DEFAULT_CHAIN_ID),
    escrow: (env.ESCROW_ADDRESS || zeroAddress) as Address,
    agentKeySource,
  };
}

export function registerConfigRoutes(app: FastifyInstance, config: ServerConfig) {
  app.get("/config", async () => ({ ...config, navPerUnit: config.navPerUnit.toString() }));
}
