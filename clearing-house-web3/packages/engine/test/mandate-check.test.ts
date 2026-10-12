import type { Mandate } from "@chw3/protocol";
import { describe, expect, it } from "vitest";
import { checkInstruction } from "../src/mandate-check.ts";
import { ONE_CASH, ONE_SHARE, type Address, type Instruction } from "../src/types.ts";

const A: Address = "0x1111111111111111111111111111111111111111";
const B: Address = "0x2222222222222222222222222222222222222222";
const FUND: Address = "0x3333333333333333333333333333333333333333";
const NAV_105 = 105n * ONE_CASH;

const MANDATE_A: Mandate = {
  participant: A,
  participantName: "Manager A",
  allowedFunds: ["Fund F"],
  maxCashPerCycle: 5_000n * ONE_CASH,
  allowedSides: ["BUY"],
  nonce: 1,
};

function order(side: "BUY" | "SELL", units: bigint, participant: Address = A): Instruction {
  return { id: "i-1", cycleId: "c1", fund: FUND, participant, side, shares: units * ONE_SHARE };
}

const CTX = { navPerUnit: NAV_105, cashCommittedInCycle: 0n, fundName: "Fund F" };

describe("checkInstruction (S-026)", () => {
  it("accepts an order inside the mandate", () => {
    // 40 units at 105 = 4 200, below the cap of 5 000
    expect(checkInstruction(order("BUY", 40n), MANDATE_A, CTX)).toEqual({ ok: true, reasons: [] });
  });

  it("accepts an order that reaches the cap exactly", () => {
    // 40 units at 125 = 5 000
    expect(checkInstruction(order("BUY", 40n), MANDATE_A, { ...CTX, navPerUnit: 125n * ONE_CASH }).ok).toBe(true);
  });

  it("refuses an order above the cap, with a readable reason", () => {
    // 100 units at 105 = 10 500
    expect(checkInstruction(order("BUY", 100n), MANDATE_A, CTX)).toEqual({
      ok: false,
      reasons: ["10500 USDC is above the signed cap of 5000 USDC per cycle"],
    });
  });

  it("counts the cash already committed in the cycle", () => {
    const check = checkInstruction(order("BUY", 10n), MANDATE_A, { ...CTX, cashCommittedInCycle: 4_000n * ONE_CASH });

    expect(check).toEqual({
      ok: false,
      reasons: ["5050 USDC in this cycle, including 1050 USDC for this order, is above the signed cap of 5000 USDC per cycle"],
    });
  });

  it("shows decimals only when there are some", () => {
    // 0.5 unit at 105 = 52.5, with a cap of 50
    const half = { ...order("BUY", 1n), shares: ONE_SHARE / 2n };
    expect(checkInstruction(half, { ...MANDATE_A, maxCashPerCycle: 50n * ONE_CASH }, CTX).reasons).toEqual([
      "52.5 USDC is above the signed cap of 50 USDC per cycle",
    ]);
  });

  it("refuses a side the mandate does not allow", () => {
    expect(checkInstruction(order("SELL", 1n), MANDATE_A, CTX).reasons).toEqual([
      "redeem is not an allowed side (allowed: subscribe)",
    ]);
  });

  it("refuses a fund the mandate does not allow", () => {
    expect(checkInstruction(order("BUY", 1n), MANDATE_A, { ...CTX, fundName: "Fund Z" }).reasons).toEqual([
      "Fund Z is not in the allowed funds (Fund F)",
    ]);
  });

  it("refuses an order checked against another participant's mandate", () => {
    expect(checkInstruction(order("BUY", 1n, B), MANDATE_A, CTX).reasons).toEqual([
      "the mandate was signed by another participant",
    ]);
  });

  it("matches the participant whatever its letter case", () => {
    const lower = { ...MANDATE_A, participant: A.toLowerCase() as Address };
    expect(checkInstruction(order("BUY", 1n), lower, CTX).ok).toBe(true);
  });

  it("refuses everything without a signed mandate", () => {
    expect(checkInstruction(order("BUY", 1n), null, CTX)).toEqual({
      ok: false,
      reasons: ["no signed mandate for this participant"],
    });
  });

  it("gives every reason at once", () => {
    const check = checkInstruction(order("SELL", 100n), MANDATE_A, { ...CTX, fundName: "Fund Z" });

    expect(check.ok).toBe(false);
    expect(check.reasons).toHaveLength(3);
  });
});
