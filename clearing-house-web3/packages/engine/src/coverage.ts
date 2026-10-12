import type { Address, Balances, Lot } from "./types.ts";

// S-016: the participants whose escrow balance would go negative with this lot.
// Empty array means the lot is covered. The escrow reverts anyway, this check
// gives the reason before any transaction.
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
