// S-016: coverage check before settlement. Same rule as SettlementEscrow,
// which reverts the whole lot if a balance would go negative.
import type { Address, Balances, Lot } from "./types.ts";

/**
 * Participants of a lot whose prefunded balance does not cover what they deliver or pay.
 *
 * Contract:
 * - A participant is short if it delivers more shares than its share balance,
 *   or pays more cash than its cash balance. What it receives needs no balance.
 * - A participant missing from `balances` holds nothing.
 * - Each participant appears once, in the order of the lot. An empty list means
 *   the lot can be settled.
 *
 * @example
 * checkCoverage(lot, { [A]: { shares: 0n, cash: 10_000_000_000n } })
 * // [A] if A must pay 10 500 in this lot
 */
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
