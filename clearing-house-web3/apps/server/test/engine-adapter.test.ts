import { describe, expect, it } from "vitest";
import type { Instruction, Lot } from "@chw3/engine";
import type { Mandate } from "@chw3/protocol";
import { checkCoverage, checkInstruction, lotHash, navHash, netPositions } from "../src/engine-adapter.ts";

const A = "0x1111111111111111111111111111111111111111" as const;
const B = "0x2222222222222222222222222222222222222222" as const;
const FUND = "0x3333333333333333333333333333333333333333" as const;
const UNIT = 10n ** 6n;
const NAV_105 = 105n * UNIT;

const order = (id: string, participant: `0x${string}`, side: "BUY" | "SELL", units: bigint): Instruction => ({
  id,
  cycleId: "c1",
  fund: FUND,
  participant,
  side,
  shares: units * UNIT,
});

describe("engine adapter (provisional until @chw3/engine lands)", () => {
  it("nets a cycle and makes the fund take the opposite, sums to zero", () => {
    const positions = netPositions([order("1", A, "BUY", 100n), order("2", B, "SELL", 40n)], NAV_105, FUND);
    expect(positions).toEqual([
      { participant: A, shares: 100n * UNIT, cash: -(10_500n * UNIT) },
      { participant: B, shares: -(40n * UNIT), cash: 4_200n * UNIT },
      { participant: FUND, shares: -(60n * UNIT), cash: 6_300n * UNIT },
    ]);
    expect(positions.reduce((sum, p) => sum + p.shares, 0n)).toBe(0n);
    expect(positions.reduce((sum, p) => sum + p.cash, 0n)).toBe(0n);
  });

  it("matches the reference lot hash of the contract tests", () => {
    const lot: Lot = {
      id: 7n,
      cycleId: "c1",
      fund: FUND,
      navPerUnit: NAV_105,
      positions: netPositions([order("1", A, "BUY", 100n), order("2", B, "SELL", 40n)], NAV_105, FUND),
      instructionIds: ["1", "2"],
    };
    expect(lotHash(lot, "0x16c97EfC46019D42ab6CdDa5dAd70C6A96568a69", "0xCd0e0EAf78435fdC882dE50833adaFCB5951a27A")).toBe(
      "0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2",
    );
  });

  it("lists the participants short of balance", () => {
    const lot: Lot = { id: 1n, cycleId: "c1", fund: FUND, navPerUnit: NAV_105, instructionIds: [], positions: netPositions([order("1", A, "BUY", 100n)], NAV_105, FUND) };
    const short = checkCoverage(lot, { [A]: { shares: 0n, cash: 10_000n * UNIT }, [FUND]: { shares: 1_000n * UNIT, cash: 0n } });
    expect(short).toEqual([A]);
  });

  it("refuses an order above the signed cap and explains why", () => {
    const mandate: Mandate = { participant: A, participantName: "Manager A", allowedFunds: ["Fund F"], maxCashPerCycle: 50_000n * UNIT, allowedSides: ["BUY", "SELL"], nonce: 1 };
    const ok = checkInstruction(order("1", A, "BUY", 100n), mandate, { navPerUnit: NAV_105, cashCommittedInCycle: 0n, fundName: "Fund F" });
    expect(ok).toEqual({ ok: true, reasons: [] });

    const tooBig = checkInstruction(order("2", A, "SELL", 1_000_000n), mandate, { navPerUnit: NAV_105, cashCommittedInCycle: 0n, fundName: "Fund F" });
    expect(tooBig.ok).toBe(false);
    expect(tooBig.reasons[0]).toContain("above the signed cap of 50000");

    const wrongFund = checkInstruction(order("3", A, "BUY", 1n), mandate, { navPerUnit: NAV_105, cashCommittedInCycle: 0n, fundName: "Fund Z" });
    expect(wrongFund.reasons[0]).toContain("Fund Z is not in the allowed funds");

    expect(checkInstruction(order("4", A, "BUY", 1n), null, { navPerUnit: NAV_105, cashCommittedInCycle: 0n, fundName: "Fund F" }).reasons).toEqual([
      "no signed mandate for this participant",
    ]);
  });

  it("gives a stable nav hash", () => {
    const inputs = { fund: FUND, cycleId: "c1", navPerUnit: NAV_105, source: "mock" };
    expect(navHash(inputs)).toBe(navHash({ ...inputs }));
    expect(navHash(inputs)).not.toBe(navHash({ ...inputs, navPerUnit: NAV_105 + 1n }));
  });
});
