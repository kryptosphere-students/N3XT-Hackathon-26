import { describe, expect, it } from "vitest";
import { instructionToText, lotApprovalToText, mandateToText } from "../src/index.ts";

const A = "0x1111111111111111111111111111111111111111" as const;
const FUND = "0x3333333333333333333333333333333333333333" as const;

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

describe("lotApprovalToText", () => {
  it("tells the participant what it receives and pays, with the lot hash", () => {
    const lot = {
      id: 7n,
      cycleId: "c1",
      fund: FUND,
      navPerUnit: 105n * 10n ** 6n,
      instructionIds: ["a"],
      positions: [
        { participant: A, shares: 100n * 10n ** 6n, cash: -(10_500n * 10n ** 6n) },
        { participant: FUND, shares: -(100n * 10n ** 6n), cash: 10_500n * 10n ** 6n },
      ],
    };
    const hash = "0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2" as const;
    expect(lotApprovalToText(lot, A, { fundName: "Fund F", lotHash: hash })).toBe(
      ["Lot 7, Fund F", "You receive 100 units", "You pay 10500 cash", "Lot hash 0xd9e1...9ea2", `Full hash ${hash}`].join("\n"),
    );
    expect(lotApprovalToText(lot, FUND, { fundName: "Fund F", lotHash: hash })).toContain("You deliver 100 units");
    expect(() => lotApprovalToText(lot, "0x4444444444444444444444444444444444444444", { fundName: "Fund F", lotHash: hash })).toThrow();
  });
});
