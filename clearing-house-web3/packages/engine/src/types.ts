// Lot format, decided in D11: net balances per participant, one fund per lot.
// All amounts are bigint with 6 decimals. Sign convention: positive receives,
// negative pays (cash) or delivers (shares).

export type Address = `0x${string}`;

export const SHARE_DECIMALS = 6;
export const CASH_DECIMALS = 6;

// 1.000000 share or 1.000000 cash unit
export const ONE_SHARE = 10n ** BigInt(SHARE_DECIMALS);
export const ONE_CASH = 10n ** BigInt(CASH_DECIMALS);

export type Side = "BUY" | "SELL";

// One signed order from a participant, before netting.
export type Instruction = {
  id: string;
  cycleId: string;
  fund: Address;
  participant: Address;
  side: Side;
  // Shares bought or sold, 6 decimals, always positive
  shares: bigint;
};

// Net balance of one participant in a lot. The fund is a participant too.
export type NetPosition = {
  participant: Address;
  // + receives shares, - delivers shares
  shares: bigint;
  // + receives cash, - pays cash
  cash: bigint;
};

// Prefunded balances of each participant in the escrow, 6 decimals.
export type Balances = Record<Address, { shares: bigint; cash: bigint }>;

// What the escrow settles in one call. Instant mode: one instruction per lot.
// Netting mode: the net positions of a whole cycle.
export type Lot = {
  // uint256 in SettlementEscrow, so the lot hash matches on both sides (S-017)
  id: bigint;
  cycleId: string;
  fund: Address;
  // Cash for one share, 6 decimals. Cash per order is floored,
  // the fund's line takes the opposite of the sum so the lot sums to zero.
  navPerUnit: bigint;
  positions: NetPosition[];
  instructionIds: string[];
};
