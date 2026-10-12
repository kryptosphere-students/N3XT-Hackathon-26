import { describe, expect, it } from "vitest";
import { cashOf, netPositions } from "../src/netting.ts";
import { ONE_CASH, ONE_SHARE, type Address, type Instruction } from "../src/types.ts";

const FUND: Address = "0x00000000000000000000000000000000000000F0";
const OTHER_FUND: Address = "0x00000000000000000000000000000000000000F1";
const A: Address = "0x000000000000000000000000000000000000000A";
const B: Address = "0x000000000000000000000000000000000000000B";
const NAV_105 = 105n * ONE_CASH;

let nextId = 0;
function order(participant: Address, side: "BUY" | "SELL", shares: bigint, fund: Address = FUND): Instruction {
  nextId += 1;
  return { id: `i-${nextId}`, cycleId: "cycle-1", fund, participant, side, shares };
}

function sums(positions: { shares: bigint; cash: bigint }[]) {
  return positions.reduce((acc, p) => ({ shares: acc.shares + p.shares, cash: acc.cash + p.cash }), {
    shares: 0n,
    cash: 0n,
  });
}

describe("cashOf", () => {
  it("prices whole shares at the NAV", () => {
    expect(cashOf(100n * ONE_SHARE, NAV_105)).toBe(10_500n * ONE_CASH);
  });

  it("rounds down to the cash unit", () => {
    // 0.000001 share at 1.5 per share is 0.0000015 cash, floored to 0.000001
    expect(cashOf(1n, 1_500_000n)).toBe(1n);
  });
});

describe("netPositions (S-015)", () => {
  it("nets the D11 example: A buys 100, B sells 80 at NAV 105", () => {
    const positions = netPositions([order(A, "BUY", 100n * ONE_SHARE), order(B, "SELL", 80n * ONE_SHARE)], NAV_105, FUND);

    expect(positions).toEqual([
      { participant: A, shares: 100n * ONE_SHARE, cash: -10_500n * ONE_CASH },
      { participant: B, shares: -80n * ONE_SHARE, cash: 8_400n * ONE_CASH },
      { participant: FUND, shares: -20n * ONE_SHARE, cash: 2_100n * ONE_CASH },
    ]);
  });

  it("sums to zero in shares and in cash", () => {
    const positions = netPositions(
      [order(A, "BUY", 100n * ONE_SHARE), order(B, "SELL", 80n * ONE_SHARE), order(A, "SELL", 7n)],
      NAV_105,
      FUND,
    );

    expect(sums(positions)).toEqual({ shares: 0n, cash: 0n });
  });

  it("aggregates several orders of one participant into one line", () => {
    const positions = netPositions([order(A, "BUY", 100n * ONE_SHARE), order(A, "SELL", 30n * ONE_SHARE)], NAV_105, FUND);

    expect(positions).toEqual([
      { participant: A, shares: 70n * ONE_SHARE, cash: -7_350n * ONE_CASH },
      { participant: FUND, shares: -70n * ONE_SHARE, cash: 7_350n * ONE_CASH },
    ]);
  });

  it("keeps participants in order of first appearance, with the fund last", () => {
    const positions = netPositions(
      [order(B, "SELL", ONE_SHARE), order(A, "BUY", ONE_SHARE), order(B, "SELL", ONE_SHARE)],
      NAV_105,
      FUND,
    );

    expect(positions.map((p) => p.participant)).toEqual([B, A, FUND]);
  });

  it("drops a participant whose orders cancel out", () => {
    const positions = netPositions(
      [order(A, "BUY", 50n * ONE_SHARE), order(A, "SELL", 50n * ONE_SHARE), order(B, "BUY", ONE_SHARE)],
      NAV_105,
      FUND,
    );

    expect(positions.map((p) => p.participant)).toEqual([B, FUND]);
  });

  it("returns only a zero fund line for an empty cycle", () => {
    expect(netPositions([], NAV_105, FUND)).toEqual([{ participant: FUND, shares: 0n, cash: 0n }]);
  });

  it("rounds cash down per order, and the fund line absorbs the rest", () => {
    // Each order is 0.000001 share at 1.5: 1 cash unit per order instead of 1.5
    const positions = netPositions([order(A, "BUY", 1n), order(A, "BUY", 1n)], 1_500_000n, FUND);

    expect(positions).toEqual([
      { participant: A, shares: 2n, cash: -2n },
      { participant: FUND, shares: -2n, cash: 2n },
    ]);
  });

  it("is deterministic and does not change its input", () => {
    const instructions = [order(A, "BUY", 100n * ONE_SHARE), order(B, "SELL", 80n * ONE_SHARE)];
    const copy = instructions.map((instruction) => ({ ...instruction }));

    expect(netPositions(instructions, NAV_105, FUND)).toEqual(netPositions(instructions, NAV_105, FUND));
    expect(instructions).toEqual(copy);
  });

  it("refuses an order on another fund", () => {
    expect(() => netPositions([order(A, "BUY", ONE_SHARE, OTHER_FUND)], NAV_105, FUND)).toThrow(/another fund/);
  });

  it("matches the fund address whatever its letter case", () => {
    const lower = FUND.toLowerCase() as Address;

    expect(() => netPositions([order(A, "BUY", ONE_SHARE, lower)], NAV_105, FUND)).not.toThrow();
  });
});
