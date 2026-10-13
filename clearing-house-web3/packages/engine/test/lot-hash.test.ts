import { describe, expect, it } from "vitest";
import { lotHash } from "../src/lot-hash.ts";
import { netPositions } from "../src/netting.ts";
import { ONE_CASH, ONE_SHARE, type Address, type Instruction, type Lot } from "../src/types.ts";

// Reference values from contracts/README.md, section "Lot hash" (checked on both sides on 12 Oct)
const SHARE_TOKEN: Address = "0x16c97EfC46019D42ab6CdDa5dAd70C6A96568a69";
const CASH_TOKEN: Address = "0xCd0e0EAf78435fdC882dE50833adaFCB5951a27A";
const A: Address = "0x1111111111111111111111111111111111111111";
const B: Address = "0x2222222222222222222222222222222222222222";
const FUND: Address = "0x3333333333333333333333333333333333333333";
const NAV_105 = 105_000_000n;
const REFERENCE_HASH = "0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2";

const REFERENCE_LOT: Lot = {
  id: 7n,
  cycleId: "c1",
  fund: FUND,
  navPerUnit: NAV_105,
  positions: [
    { participant: A, shares: 100_000_000n, cash: -10_500_000_000n },
    { participant: B, shares: -40_000_000n, cash: 4_200_000_000n },
    { participant: FUND, shares: -60_000_000n, cash: 6_300_000_000n },
  ],
  instructionIds: ["1", "2"],
};

function order(id: string, participant: Address, side: "BUY" | "SELL", units: bigint): Instruction {
  return { id, cycleId: "c1", fund: FUND, participant, side, shares: units * ONE_SHARE };
}

describe("lotHash (S-017)", () => {
  it("matches the reference hash computed by SettlementEscrow.hashLot", () => {
    expect(lotHash(REFERENCE_LOT, SHARE_TOKEN, CASH_TOKEN)).toBe(REFERENCE_HASH);
  });

  it("matches the reference when the positions come from netPositions", () => {
    const positions = netPositions([order("1", A, "BUY", 100n), order("2", B, "SELL", 40n)], NAV_105, FUND);

    expect(lotHash({ ...REFERENCE_LOT, positions }, SHARE_TOKEN, CASH_TOKEN)).toBe(REFERENCE_HASH);
  });

  it("ignores cycleId and instructionIds, which the contract does not hash", () => {
    const other = { ...REFERENCE_LOT, cycleId: "another cycle", instructionIds: [] };

    expect(lotHash(other, SHARE_TOKEN, CASH_TOKEN)).toBe(REFERENCE_HASH);
  });

  it("changes when the lot id, a token, the NAV or a position changes", () => {
    const changed = [
      lotHash({ ...REFERENCE_LOT, id: 8n }, SHARE_TOKEN, CASH_TOKEN),
      lotHash(REFERENCE_LOT, CASH_TOKEN, SHARE_TOKEN),
      lotHash({ ...REFERENCE_LOT, navPerUnit: NAV_105 + 1n }, SHARE_TOKEN, CASH_TOKEN),
      lotHash(
        { ...REFERENCE_LOT, positions: [{ ...REFERENCE_LOT.positions[0]!, cash: -10_500n * ONE_CASH - 1n }, ...REFERENCE_LOT.positions.slice(1)] },
        SHARE_TOKEN,
        CASH_TOKEN,
      ),
    ];

    for (const hash of changed) expect(hash).not.toBe(REFERENCE_HASH);
  });

  it("depends on the order of the positions", () => {
    const reversed = { ...REFERENCE_LOT, positions: [...REFERENCE_LOT.positions].reverse() };

    expect(lotHash(reversed, SHARE_TOKEN, CASH_TOKEN)).not.toBe(REFERENCE_HASH);
  });
});
