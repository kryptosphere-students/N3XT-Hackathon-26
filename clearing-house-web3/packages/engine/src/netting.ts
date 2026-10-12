import { ONE_SHARE, type Address, type Instruction, type NetPosition } from "./types.ts";

// Cash of one order at a NAV, rounded down (D11).
export function cashOf(shares: bigint, navPerUnit: bigint): bigint {
  return (shares * navPerUnit) / ONE_SHARE;
}

// S-015: net shares and cash per participant. The fund takes the opposite of
// the sums, so the lot always sums to zero, which the escrow checks again.
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
