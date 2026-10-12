import { formatUnits, type Hex } from "viem";
import { CASH_DECIMALS, SHARE_DECIMALS, type Address, type Lot } from "@chw3/engine";

// S-021: what a participant reads on the Flex before a lot is settled.
// The lot hash binds the approval to this exact lot (same hash as LotSettled).
// The short form is what a human compares with the screen, the full hash is what the audit uses.
export type LotApprovalDisplay = { fundName: string; lotHash: Hex };

const SHORT_HASH_EDGE = 6;

export function shortHash(hash: Hex): string {
  return `${hash.slice(0, SHORT_HASH_EDGE)}...${hash.slice(-4)}`;
}

export function lotApprovalToText(lot: Lot, participant: Address, display: LotApprovalDisplay): string {
  const position = lot.positions.find((p) => p.participant.toLowerCase() === participant.toLowerCase());
  if (!position) throw new Error(`participant ${participant} is not in lot ${lot.id}`);
  const shares = formatUnits(position.shares < 0n ? -position.shares : position.shares, SHARE_DECIMALS);
  const cash = formatUnits(position.cash < 0n ? -position.cash : position.cash, CASH_DECIMALS);
  return [
    `Lot ${lot.id}, ${display.fundName}`,
    position.shares < 0n ? `You deliver ${shares} units` : `You receive ${shares} units`,
    position.cash < 0n ? `You pay ${cash} cash` : `You receive ${cash} cash`,
    `Lot hash ${shortHash(display.lotHash)}`,
    `Full hash ${display.lotHash}`,
  ].join("\n");
}
