// S-015: net balances of a cycle, as decided in D11.
import { ONE_SHARE, type Address, type Instruction, type NetPosition } from "./types.ts";

/**
 * Cash of one order at a NAV, rounded down to the cash unit.
 *
 * @param shares Shares of the order, 6 decimals, positive.
 * @param navPerUnit Cash for one share, 6 decimals.
 * @returns floor(shares * navPerUnit / ONE_SHARE), 6 decimals.
 * @example cashOf(100_000_000n, 105_000_000n) // 10_500_000_000n: 100 shares at 105 cost 10 500
 */
export function cashOf(shares: bigint, navPerUnit: bigint): bigint {
  return (shares * navPerUnit) / ONE_SHARE;
}

/**
 * Net shares and cash per participant for one fund and one NAV.
 *
 * Contract:
 * - BUY gives the participant + shares and - cash, SELL the opposite.
 * - Cash is rounded down per order (cashOf), then summed per participant.
 * - One line per participant, in order of first appearance. A participant
 *   whose orders cancel out (0 shares and 0 cash) has no line.
 * - The fund's line comes last and takes the opposite of the sum of the other
 *   lines, so the result sums to zero in shares and in cash. It is always present.
 * - Throws if an instruction is on another fund. The input is not modified.
 *
 * The line order is part of the lot hash (S-017): do not sort the result.
 *
 * @example
 * netPositions([buyA100, sellB80], 105_000_000n, fund)
 * // A: +100 shares, -10 500 cash; B: -80, +8 400; fund: -20, +2 100
 */
export function netPositions(instructions: Instruction[], navPerUnit: bigint, fund: Address): NetPosition[] {
  const byParticipant = new Map<Address, { shares: bigint; cash: bigint }>();

  for (const instruction of instructions) {
    if (instruction.fund.toLowerCase() !== fund.toLowerCase()) {
      throw new Error(`Instruction ${instruction.id} is on another fund: ${instruction.fund}, expected ${fund}`);
    }
    const sign = instruction.side === "BUY" ? 1n : -1n;
    const net = byParticipant.get(instruction.participant) ?? { shares: 0n, cash: 0n };
    byParticipant.set(instruction.participant, {
      shares: net.shares + sign * instruction.shares,
      cash: net.cash - sign * cashOf(instruction.shares, navPerUnit),
    });
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
