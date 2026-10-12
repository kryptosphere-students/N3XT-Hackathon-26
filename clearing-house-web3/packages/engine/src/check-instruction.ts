import { cashOf } from "./netting.ts";
import { ONE_CASH, type Instruction, type Mandate } from "./types.ts";

export type InstructionCheck = { ok: boolean; reasons: string[] };

export type InstructionContext = {
  navPerUnit: bigint;
  // Cash already committed by the participant in this cycle, 6 decimals
  cashCommittedInCycle: bigint;
  // Display name of the instruction's fund, matched against mandate.allowedFunds
  fundName: string;
};

// S-026: the mandate check, by code, never by the LLM. Fund, side and cap per cycle.
// Every reason is a short sentence meant for the screen.
export function checkInstruction(instruction: Instruction, mandate: Mandate | null, ctx: InstructionContext): InstructionCheck {
  const reasons: string[] = [];
  if (!mandate) return { ok: false, reasons: ["no signed mandate for this participant"] };
  if (mandate.participant.toLowerCase() !== instruction.participant.toLowerCase()) {
    reasons.push("mandate signed by another participant");
  }
  if (!mandate.allowedFunds.includes(ctx.fundName)) {
    reasons.push(`${ctx.fundName} is not in the allowed funds (${mandate.allowedFunds.join(", ")})`);
  }
  if (!mandate.allowedSides.includes(instruction.side)) {
    reasons.push(`${instruction.side === "BUY" ? "subscribe" : "redeem"} is not an allowed side`);
  }
  const cash = cashOf(instruction.shares, ctx.navPerUnit);
  const committed = ctx.cashCommittedInCycle + cash;
  if (committed > mandate.maxCashPerCycle) {
    reasons.push(
      `${wholeCash(cash)} cash for this order, ${wholeCash(committed)} in the cycle, above the signed cap of ${wholeCash(mandate.maxCashPerCycle)} per cycle`,
    );
  }
  return { ok: reasons.length === 0, reasons };
}

function wholeCash(amount: bigint): string {
  return (amount / ONE_CASH).toString();
}
