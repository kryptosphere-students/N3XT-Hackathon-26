import { formatUnits } from "viem";
import { CASH_DECIMALS, SHARE_DECIMALS } from "@chw3/engine";

// Display only. Amounts are computed in bigint everywhere else.
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

export function units(value: string | bigint): string {
  return number.format(Number(formatUnits(abs(BigInt(value)), SHARE_DECIMALS)));
}

export function cash(value: string | bigint): string {
  return number.format(Number(formatUnits(abs(BigInt(value)), CASH_DECIMALS)));
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function time(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB");
}

export function sideLabel(side: "BUY" | "SELL"): string {
  return side === "BUY" ? "Subscribe" : "Redeem";
}
