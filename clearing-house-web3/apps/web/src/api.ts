import type { Address, Hex } from "viem";
import type { Mandate, InstructionPayload } from "@chw3/protocol";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8787";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(SERVER_URL + path, { headers: { "content-type": "application/json" }, ...init });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${body.error ?? res.statusText}`);
  return body as T;
}

function post(body: unknown) {
  return { method: "POST", body: JSON.stringify(body) };
}

export type ServerConfig = {
  funds: { name: string; address: Address }[];
  participants: { key: "A" | "B" | "C"; name: string; address: Address }[];
  navPerUnit: string;
  chainId: number;
  escrow: Address;
  agentKeySource: "key-ring" | "env" | "none";
};

export type StoredMandate = {
  participant: Address;
  participantName: string;
  allowedFunds: string[];
  maxCashPerCycle: string;
  allowedSides: ("BUY" | "SELL")[];
  nonce: number;
  receivedAt: string;
};

export type InstructionStatus = "signed" | "rejected" | "in_lot" | "settled";

export type StoredInstruction = {
  id: string;
  cycleId: string;
  fund: Address;
  participant: Address;
  participantName: string;
  fundName: string;
  side: "BUY" | "SELL";
  shares: string;
  nonce: number;
  status: InstructionStatus;
  reasons: string[];
  lotId?: string;
  receivedAt: string;
};

export type LotStatus = "pending" | "approved" | "settled" | "failed";

export type LotView = {
  id: string;
  cycleId: string;
  mode: "netting" | "instant";
  fund: Address;
  fundName: string;
  navPerUnit: string;
  lotHash: Hex;
  positions: { participant: Address; shares: string; cash: string }[];
  instructionIds: string[];
  approvers: Address[];
  approvals: { participant: Address; receivedAt: string }[];
  missing: Address[];
  texts: Record<Address, string>;
  gross: { shares: string; cash: string };
  net: { shares: string; cash: string };
  status: LotStatus;
  txHash?: Hex;
  explorerUrl?: string | null;
  error?: string;
};

export type Draft = { fundName: string; participantName: string; side: "BUY" | "SELL"; shares: string };

export type IntakeResult = {
  draft: Draft | null;
  explanation: string;
  modelUsed: string;
  refusedTools: string[];
  check: { ok: boolean; reasons: string[] } | null;
};

export const getConfig = () => call<ServerConfig>("/config");
export const getMandates = () => call<StoredMandate[]>("/mandates");
export const getInstructions = () => call<StoredInstruction[]>("/instructions");
export const getLots = () => call<LotView[]>("/lots");
export const getDemoEmails = () => call<Record<"clear" | "ambiguous" | "trapped", string>>("/demo/emails");
export const getNonces = (participant: Address) => call<{ mandate: number; instruction: number }>(`/participants/${participant}/nonces`);

// bigint goes over the wire as a decimal string (see server schemas.ts).
export function postMandate(mandate: Mandate, signature: Hex) {
  return call<StoredMandate>("/mandates", post({ mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature }));
}

export function postInstruction(payload: InstructionPayload, signature: Hex) {
  const { instruction } = payload;
  return call<StoredInstruction>("/instructions", post({ ...payload, instruction: { ...instruction, shares: instruction.shares.toString() }, signature }));
}

export function createLot(cycleId: string, mode: "netting" | "instant", instructionId?: string) {
  return call<LotView>(`/cycles/${cycleId}/lots`, post({ mode, instructionId }));
}

export function approveLot(lotId: string, participant: Address, signature: Hex) {
  return call<LotView>(`/lots/${lotId}/approvals`, post({ participant, signature }));
}

export function intake(emailText: string) {
  return call<IntakeResult>("/intake", post({ emailText }));
}
