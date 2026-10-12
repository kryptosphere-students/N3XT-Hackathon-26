import { encodeAbiParameters, keccak256, stringToHex, type Hex } from "viem";
import { ONE_SHARE, type Address, type Instruction, type Lot, type NetPosition } from "@chw3/engine";
import type { Mandate } from "@chw3/protocol";

// The server only talks to the engine through this file.
// Signatures agreed with Louis on 12 Oct. Everything below is a provisional
// implementation, to be replaced by the exports of @chw3/engine once his
// branch (louis/s-015-engine) is merged.
// TODO(Louis, S-015 to S-018, S-026, S-041): import from "@chw3/engine" and delete the bodies.

export type Balances = Record<Address, { shares: bigint; cash: bigint }>;

export type InstructionCheck = { ok: boolean; reasons: string[] };

export type InstructionContext = {
  navPerUnit: bigint;
  // Cash already committed by the participant in this cycle, 6 decimals
  cashCommittedInCycle: bigint;
  // Display name of the instruction's fund, matched against mandate.allowedFunds
  fundName: string;
};

export type NavInputs = { fund: Address; cycleId: string; navPerUnit: bigint; source: string };

// Cash of one order at a NAV, rounded down (D11).
export function cashOf(shares: bigint, navPerUnit: bigint): bigint {
  return (shares * navPerUnit) / ONE_SHARE;
}

// TODO(S-015): provisional netting. Net shares and cash per participant, the fund takes the opposite.
export function netPositions(instructions: Instruction[], navPerUnit: bigint, fund: Address): NetPosition[] {
  const byParticipant = new Map<Address, { shares: bigint; cash: bigint }>();
  for (const instruction of instructions) {
    const current = byParticipant.get(instruction.participant) ?? { shares: 0n, cash: 0n };
    const cash = cashOf(instruction.shares, navPerUnit);
    const sign = instruction.side === "BUY" ? 1n : -1n;
    current.shares += sign * instruction.shares;
    current.cash -= sign * cash;
    byParticipant.set(instruction.participant, current);
  }
  const positions: NetPosition[] = [];
  let sharesSum = 0n;
  let cashSum = 0n;
  for (const [participant, net] of byParticipant) {
    if (net.shares === 0n && net.cash === 0n) continue;
    positions.push({ participant, shares: net.shares, cash: net.cash });
    sharesSum += net.shares;
    cashSum += net.cash;
  }
  positions.push({ participant: fund, shares: -sharesSum, cash: -cashSum });
  return positions;
}

// TODO(S-016): provisional coverage check. Returns the participants whose balance would go negative.
export function checkCoverage(lot: Lot, balances: Balances): Address[] {
  const short: Address[] = [];
  for (const position of lot.positions) {
    const balance = balances[position.participant] ?? { shares: 0n, cash: 0n };
    const sharesShort = position.shares < 0n && balance.shares < -position.shares;
    const cashShort = position.cash < 0n && balance.cash < -position.cash;
    if (sharesShort || cashShort) short.push(position.participant);
  }
  return short;
}

// TODO(S-017): provisional. Same encoding as SettlementEscrow.hashLot, checked against
// the reference values in contracts/README.md.
export function lotHash(lot: Lot, shareToken: Address, cashToken: Address): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "uint256" },
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        {
          type: "tuple[]",
          components: [
            { name: "participant", type: "address" },
            { name: "shares", type: "int256" },
            { name: "cash", type: "int256" },
          ],
        },
      ],
      [lot.id, shareToken, cashToken, lot.navPerUnit, lot.positions],
    ),
  );
}

// TODO(S-026): provisional mandate check. Code, not the LLM: fund, side and cap per cycle.
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
      `${formatCash(cash)} cash for this order, ${formatCash(committed)} in the cycle, above the signed cap of ${formatCash(mandate.maxCashPerCycle)} per cycle`,
    );
  }
  return { ok: reasons.length === 0, reasons };
}

// TODO(S-041): provisional NAV hash: keccak256 of the inputs as a stable JSON text.
export function navHash(inputs: NavInputs): Hex {
  const text = JSON.stringify({ ...inputs, navPerUnit: inputs.navPerUnit.toString() });
  return keccak256(stringToHex(text));
}

function formatCash(amount: bigint): string {
  return (amount / ONE_SHARE).toString();
}
