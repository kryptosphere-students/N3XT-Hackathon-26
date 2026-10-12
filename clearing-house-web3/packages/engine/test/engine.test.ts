import { describe, expect, it } from "vitest";
import { checkCoverage } from "../src/coverage.ts";
import { checkInstruction } from "../src/check-instruction.ts";
import { lotHash } from "../src/lot-hash.ts";
import { navHash } from "../src/nav.ts";
import { netPositions } from "../src/netting.ts";
import type { Instruction, Lot, Mandate } from "../src/types.ts";

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

describe("lotHash (S-017)", () => {
  it("matches the reference hash of the contract tests", () => {
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
});

describe("checkCoverage (S-016)", () => {
  it("lists the participants short of balance", () => {
    const lot: Lot = { id: 1n, cycleId: "c1", fund: FUND, navPerUnit: NAV_105, instructionIds: [], positions: netPositions([order("1", A, "BUY", 100n)], NAV_105, FUND) };
    expect(checkCoverage(lot, { [A]: { shares: 0n, cash: 10_000n * UNIT }, [FUND]: { shares: 1_000n * UNIT, cash: 0n } })).toEqual([A]);
    expect(checkCoverage(lot, { [A]: { shares: 0n, cash: 10_500n * UNIT }, [FUND]: { shares: 100n * UNIT, cash: 0n } })).toEqual([]);
  });
});

describe("checkInstruction (S-026)", () => {
  const mandate: Mandate = { participant: A, participantName: "Manager A", allowedFunds: ["Fund F"], maxCashPerCycle: 50_000n * UNIT, allowedSides: ["BUY", "SELL"], nonce: 1 };
  const ctx = { navPerUnit: NAV_105, cashCommittedInCycle: 0n, fundName: "Fund F" };

  it("accepts an order inside the mandate", () => {
    expect(checkInstruction(order("1", A, "BUY", 100n), mandate, ctx)).toEqual({ ok: true, reasons: [] });
  });

  it("refuses an order above the signed cap and explains why", () => {
    const tooBig = checkInstruction(order("2", A, "SELL", 1_000_000n), mandate, ctx);
    expect(tooBig.ok).toBe(false);
    expect(tooBig.reasons[0]).toContain("above the signed cap of 50000");
  });

  it("counts the cash already committed in the cycle", () => {
    expect(checkInstruction(order("3", A, "BUY", 100n), mandate, { ...ctx, cashCommittedInCycle: 45_000n * UNIT }).ok).toBe(false);
  });

  it("refuses a wrong fund, a wrong side, another participant, no mandate", () => {
    expect(checkInstruction(order("4", A, "BUY", 1n), mandate, { ...ctx, fundName: "Fund Z" }).reasons[0]).toContain("Fund Z is not in the allowed funds");
    expect(checkInstruction(order("5", A, "SELL", 1n), { ...mandate, allowedSides: ["BUY"] }, ctx).reasons[0]).toContain("redeem is not an allowed side");
    expect(checkInstruction(order("6", B, "BUY", 1n), mandate, ctx).reasons[0]).toContain("another participant");
    expect(checkInstruction(order("7", A, "BUY", 1n), null, ctx).reasons).toEqual(["no signed mandate for this participant"]);
  });
});

describe("navHash (S-041)", () => {
  it("is stable and changes with the inputs", () => {
    const inputs = { fund: FUND, cycleId: "c1", navPerUnit: NAV_105, source: "mock" };
    expect(navHash(inputs)).toBe(navHash({ ...inputs }));
    expect(navHash(inputs)).not.toBe(navHash({ ...inputs, navPerUnit: NAV_105 + 1n }));
  });
});
