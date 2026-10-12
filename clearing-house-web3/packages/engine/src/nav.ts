import { keccak256, stringToHex, type Hex } from "viem";
import type { Address } from "./types.ts";

// S-041: what goes into the NAV hash published with each lot.
export type NavInputs = { fund: Address; cycleId: string; navPerUnit: bigint; source: string };

// keccak256 of the inputs as a stable JSON text. Same inputs, same hash, on any machine.
export function navHash(inputs: NavInputs): Hex {
  const text = JSON.stringify({ fund: inputs.fund, cycleId: inputs.cycleId, navPerUnit: inputs.navPerUnit.toString(), source: inputs.source });
  return keccak256(stringToHex(text));
}
