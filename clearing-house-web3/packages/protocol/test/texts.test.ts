import { describe, expect, it } from "vitest";
import { instructionToText, mandateToText } from "../src/index.ts";

const A = "0x1111111111111111111111111111111111111111";
const FUND = "0x3333333333333333333333333333333333333333";

describe("mandateToText", () => {
  it("is a stable, readable text with the nonce", () => {
    const text = mandateToText({
      participant: A,
      participantName: "Manager A",
      allowedFunds: ["Fund F"],
      maxCashPerCycle: 5_000_000n * 10n ** 6n,
      allowedSides: ["BUY", "SELL"],
      nonce: 1,
    });
    expect(text).toBe(
      ["Clearing house mandate", "Manager A", "Funds: Fund F", "Max per cycle: 5000000 cash", "Sides: subscribe, redeem", "Nonce 1"].join("\n"),
    );
  });
});

describe("instructionToText", () => {
  it("shows the order, the side, the units and the nonce", () => {
    const text = instructionToText({
      instruction: { id: "a1b2c3", cycleId: "2026-10-12", fund: FUND, participant: A, side: "BUY", shares: 100n * 10n ** 6n },
      fundName: "Fund F",
      participantName: "Manager A",
      nonce: 7,
    });
    expect(text).toBe(["Fund F order a1b2c3", "Subscribe 100 units", "Cycle 2026-10-12", "Manager A", "Nonce 7"].join("\n"));
  });

  it("keeps fractional units and says Redeem for a sale", () => {
    const text = instructionToText({
      instruction: { id: "x", cycleId: "c", fund: FUND, participant: A, side: "SELL", shares: 12_500_000n },
      fundName: "Fund F",
      participantName: "Manager B",
      nonce: 2,
    });
    expect(text).toContain("Redeem 12.5 units");
  });
});
