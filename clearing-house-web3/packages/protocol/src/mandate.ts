import { formatUnits } from "viem";
import { CASH_DECIMALS, type Mandate, type Side } from "@chw3/engine";

export type { Mandate } from "@chw3/engine";

export const SIDE_LABEL: Record<Side, string> = { BUY: "subscribe", SELL: "redeem" };

// The exact text shown on the Flex and signed with EIP-191 (S-019).
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
