import type { FastifyInstance } from "fastify";
import { zeroAddress, type Address } from "viem";
import type { AgentKeySource } from "../agents/secret.ts";
import { computeNav, navInputsFromJson, type NavFixture, type NavInputs } from "../engine-adapter.ts";

// What the browser needs and may know: no secrets here.
export type Participant = { key: "A" | "B" | "C"; name: string; address: Address };

export type ServerConfig = {
  funds: { name: string; address: Address }[];
  participants: Participant[];
  // NAV inputs of the fund administrator (S-024) and the NAV computed from them (S-041)
  navInputs: NavInputs;
  navPerUnit: bigint;
  chainId: number;
  escrow: Address;
  // Where the LLM key came from at startup: Ledger Key Ring, plain .env, or nothing (S-023)
  agentKeySource: AgentKeySource;
};

export const FUND_F_NAME = "Fund F";
const DEFAULT_CHAIN_ID = 84532;

export function configFromEnv(env: NodeJS.ProcessEnv, navFixture: NavFixture, agentKeySource: AgentKeySource = "none"): ServerConfig {
  const fund = (env.FUND_ADDRESS || env.DEPLOYER_PUBLIC_KEY || zeroAddress) as Address;
  const navInputs = navInputsFromJson(navFixture);
  return {
    funds: [{ name: FUND_F_NAME, address: fund }],
    participants: [
      { key: "A", name: "Manager A", address: (env.PARTICIPANT_A_ADDRESS || zeroAddress) as Address },
      { key: "B", name: "Manager B", address: (env.PARTICIPANT_B_ADDRESS || zeroAddress) as Address },
      { key: "C", name: "Depositary C", address: (env.PARTICIPANT_C_ADDRESS || zeroAddress) as Address },
    ],
    navInputs,
    navPerUnit: computeNav(navInputs),
    chainId: Number(env.CHAIN_ID ?? DEFAULT_CHAIN_ID),
    escrow: (env.ESCROW_ADDRESS || zeroAddress) as Address,
    agentKeySource,
  };
}

export function registerConfigRoutes(app: FastifyInstance, config: ServerConfig) {
  app.get("/config", async () => ({ ...config, navInputs: undefined, navPerUnit: config.navPerUnit.toString(), navDate: config.navInputs.navDate, navSource: config.navInputs.source }));
}
