// S-017: lot hash, identical to SettlementEscrow.hashLot (reference values in contracts/README.md).
import { encodeAbiParameters, keccak256, type Hex } from "viem";
import type { Address, Lot } from "./types.ts";

const LOT_HASH_ABI = [
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
] as const;

/**
 * Hash of a lot, as published in the LotSettled event.
 *
 * Contract: keccak256(abi.encode(lotId, shareToken, cashToken, navPerUnit, positions)),
 * with positions as (address participant, int256 shares, int256 cash)[]. `cycleId`
 * and `instructionIds` are not hashed. The order of the positions matters.
 *
 * @example
 * lotHash(lot, shareToken, cashToken) // "0xd9e1…9ea2" for the reference lot of contracts/README.md
 */
export function lotHash(lot: Lot, shareToken: Address, cashToken: Address): Hex {
  return keccak256(
    encodeAbiParameters(LOT_HASH_ABI, [lot.id, shareToken, cashToken, lot.navPerUnit, lot.positions]),
  );
}
