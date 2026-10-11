import type { Address, Hex } from "viem";
import type { Mandate, InstructionPayload } from "@chw3/protocol";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8787";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(SERVER_URL + path, { headers: { "content-type": "application/json" }, ...init });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${body.error ?? res.statusText}`);
  return body as T;
}

export type ServerConfig = { funds: { name: string; address: Address }[] };

export function getConfig() {
  return call<ServerConfig>("/config");
}

export function getNonces(participant: Address) {
  return call<{ mandate: number; instruction: number }>(`/participants/${participant}/nonces`);
}

// bigint goes over the wire as a decimal string (see server schemas.ts).
export function postMandate(mandate: Mandate, signature: Hex) {
  return call("/mandates", {
    method: "POST",
    body: JSON.stringify({ mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature }),
  });
}

export function postInstruction(payload: InstructionPayload, signature: Hex) {
  const { instruction } = payload;
  return call("/instructions", {
    method: "POST",
    body: JSON.stringify({ ...payload, instruction: { ...instruction, shares: instruction.shares.toString() }, signature }),
  });
}
