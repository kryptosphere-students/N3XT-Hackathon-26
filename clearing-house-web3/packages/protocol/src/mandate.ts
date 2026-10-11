import { formatUnits } from "viem";
import { CASH_DECIMALS, type Address, type Side } from "@chw3/engine";

// Rules a manager signs once on the Flex. The server checks every
// instruction against them (S-026). The nonce makes each signed text unique.
export type Mandate = {
  participant: Address;
  participantName: string;
  allowedFunds: string[];
  // Cash, 6 decimals
  maxCashPerCycle: bigint;
  allowedSides: Side[];
  nonce: number;
};

export const SIDE_LABEL: Record<Side, string> = { BUY: "subscribe", SELL: "redeem" };

// The exact text shown on the Flex and signed with EIP-191.
// Changing one character changes the signature, so this stays stable.
export function mandateToText(mandate: Mandate): string {
  return [
    "Clearing house mandate",
    mandate.participantName,
    `Funds: ${mandate.allowedFunds.join(", ")}`,
    `Max per cycle: ${formatUnits(mandate.maxCashPerCycle, CASH_DECIMALS)} cash`,
    `Sides: ${mandate.allowedSides.map((side) => SIDE_LABEL[side]).join(", ")}`,
    `Nonce ${mandate.nonce}`,
  ].join("\n");
}
