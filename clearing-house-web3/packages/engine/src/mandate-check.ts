// S-026: deterministic check of an instruction against the mandate its manager
// signed on the Flex. Code decides; the LLM only explains the reasons.
import { formatUnits } from "viem";
import { cashOf } from "./netting.ts";
import { CASH_DECIMALS, type Instruction, type Mandate, type Side } from "./types.ts";

// Label of the mock cash token in readable reasons
export const CASH_LABEL = "USDC";

const SIDE_WORD: Record<Side, string> = { BUY: "subscribe", SELL: "redeem" };

export type InstructionContext = {
  // Cash for one share, 6 decimals
  navPerUnit: bigint;
  // Cash of the participant's other orders in this cycle, 6 decimals
  cashCommittedInCycle: bigint;
  // Display name of the instruction's fund, matched against mandate.allowedFunds
  fundName: string;
};

export type InstructionCheck = { ok: boolean; reasons: string[] };

/**
 * Checks one instruction against the signed mandate of its participant.
 *
 * Contract:
 * - No mandate: refused, with one reason.
 * - Otherwise every broken rule gives one readable reason: mandate of another
 *   participant, fund not allowed, side not allowed, cash of the cycle above the cap.
 * - The cap applies to cashCommittedInCycle plus the cash of this order
 *   (cashOf, rounded down). Reaching the cap exactly is allowed.
 * - ok is true only when there is no reason.
 *
 * @example
 * checkInstruction(buy100, mandateWithCap5000, { navPerUnit: 105_000_000n, cashCommittedInCycle: 0n, fundName: "Fund F" })
 * // { ok: false, reasons: ["10500 USDC is above the signed cap of 5000 USDC per cycle"] }
 */
export function checkInstruction(
  instruction: Instruction,
  mandate: Mandate | null,
  ctx: InstructionContext,
): InstructionCheck {
  if (!mandate) return { ok: false, reasons: ["no signed mandate for this participant"] };

  const reasons: string[] = [];
  if (mandate.participant.toLowerCase() !== instruction.participant.toLowerCase()) {
    reasons.push("the mandate was signed by another participant");
  }
  if (!mandate.allowedFunds.includes(ctx.fundName)) {
    reasons.push(`${ctx.fundName} is not in the allowed funds (${mandate.allowedFunds.join(", ")})`);
  }
  if (!mandate.allowedSides.includes(instruction.side)) {
    const allowed = mandate.allowedSides.map((side) => SIDE_WORD[side]).join(", ");
    reasons.push(`${SIDE_WORD[instruction.side]} is not an allowed side (allowed: ${allowed})`);
  }

  const cash = cashOf(instruction.shares, ctx.navPerUnit);
  const committed = ctx.cashCommittedInCycle + cash;
  if (committed > mandate.maxCashPerCycle) {
    const amount =
      ctx.cashCommittedInCycle === 0n
        ? formatCash(cash)
        : `${formatCash(committed)} in this cycle, including ${formatCash(cash)} for this order,`;
    reasons.push(`${amount} is above the signed cap of ${formatCash(mandate.maxCashPerCycle)} per cycle`);
  }

  return { ok: reasons.length === 0, reasons };
}

function formatCash(amount: bigint): string {
  return `${formatUnits(amount, CASH_DECIMALS)} ${CASH_LABEL}`;
}
