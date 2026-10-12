import { encodeAbiParameters, keccak256, type Hex } from "viem";
import type { Address, Lot } from "./types.ts";

// S-017: same encoding as SettlementEscrow.hashLot, so the approval text and the
// LotSettled event carry the same hash. Reference values in contracts/README.md.
// cycleId is not part of the hash (D11).
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
