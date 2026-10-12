import { describe, expect, it } from "vitest";
import { checkCoverage } from "../src/coverage.ts";
import { ONE_CASH, ONE_SHARE, type Address, type Lot, type NetPosition } from "../src/types.ts";

const A: Address = "0x1111111111111111111111111111111111111111";
const B: Address = "0x2222222222222222222222222222222222222222";
const FUND: Address = "0x3333333333333333333333333333333333333333";

function lotOf(positions: NetPosition[]): Lot {
  return { id: 1n, cycleId: "c1", fund: FUND, navPerUnit: 105n * ONE_CASH, positions, instructionIds: [] };
}

// D11 example: A buys 100, B sells 40 at NAV 105, the fund delivers 60
const D11_LOT = lotOf([
  { participant: A, shares: 100n * ONE_SHARE, cash: -10_500n * ONE_CASH },
  { participant: B, shares: -40n * ONE_SHARE, cash: 4_200n * ONE_CASH },
  { participant: FUND, shares: -60n * ONE_SHARE, cash: 6_300n * ONE_CASH },
]);

describe("checkCoverage (S-016)", () => {
  it("returns nobody when every payer and deliverer is covered", () => {
    const balances = {
      [A]: { shares: 0n, cash: 10_500n * ONE_CASH },
      [B]: { shares: 40n * ONE_SHARE, cash: 0n },
      [FUND]: { shares: 60n * ONE_SHARE, cash: 0n },
    };

    expect(checkCoverage(D11_LOT, balances)).toEqual([]);
  });

  it("flags a participant short of cash", () => {
    const balances = {
      [A]: { shares: 0n, cash: 10_500n * ONE_CASH - 1n },
      [B]: { shares: 40n * ONE_SHARE, cash: 0n },
      [FUND]: { shares: 60n * ONE_SHARE, cash: 0n },
    };

    expect(checkCoverage(D11_LOT, balances)).toEqual([A]);
  });

  it("flags a participant short of shares", () => {
    const balances = {
      [A]: { shares: 0n, cash: 10_500n * ONE_CASH },
      [B]: { shares: 39n * ONE_SHARE, cash: 0n },
      [FUND]: { shares: 60n * ONE_SHARE, cash: 0n },
    };

    expect(checkCoverage(D11_LOT, balances)).toEqual([B]);
  });

  it("treats a participant missing from the balances as holding nothing", () => {
    const balances = { [A]: { shares: 0n, cash: 10_500n * ONE_CASH } };

    expect(checkCoverage(D11_LOT, balances)).toEqual([B, FUND]);
  });

  it("does not require a balance for what a participant receives", () => {
    const lot = lotOf([
      { participant: A, shares: 5n * ONE_SHARE, cash: 0n },
      { participant: FUND, shares: -5n * ONE_SHARE, cash: 0n },
    ]);

    expect(checkCoverage(lot, { [FUND]: { shares: 5n * ONE_SHARE, cash: 0n } })).toEqual([]);
  });

  it("lists a participant once, in lot order, even when short of both", () => {
    const lot = lotOf([
      { participant: B, shares: -ONE_SHARE, cash: -ONE_CASH },
      { participant: A, shares: -ONE_SHARE, cash: 0n },
      { participant: FUND, shares: 2n * ONE_SHARE, cash: ONE_CASH },
    ]);

    expect(checkCoverage(lot, {})).toEqual([B, A]);
  });
});
