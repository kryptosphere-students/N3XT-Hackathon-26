import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { cashOf, netPositions } from "../src/netting.ts";
import type { Instruction } from "../src/types.ts";

const A = "0x1111111111111111111111111111111111111111" as const;
const B = "0x2222222222222222222222222222222222222222" as const;
const C = "0x4444444444444444444444444444444444444444" as const;
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

describe("netPositions (S-015)", () => {
  it("nets a cycle, the fund takes the opposite, sums to zero", () => {
    const positions = netPositions([order("1", A, "BUY", 100n), order("2", B, "SELL", 40n)], NAV_105, FUND);
    expect(positions).toEqual([
      { participant: A, shares: 100n * UNIT, cash: -(10_500n * UNIT) },
      { participant: B, shares: -(40n * UNIT), cash: 4_200n * UNIT },
      { participant: FUND, shares: -(60n * UNIT), cash: 6_300n * UNIT },
    ]);
  });

  it("merges several orders of one participant and drops a flat position", () => {
    const positions = netPositions([order("1", A, "BUY", 50n), order("2", A, "SELL", 50n), order("3", B, "BUY", 1n)], NAV_105, FUND);
    expect(positions.map((p) => p.participant)).toEqual([B, FUND]);
  });

  it("rounds the cash of each order down", () => {
    expect(cashOf(1n, 105_500_001n)).toBe(105n);
  });

  it("property: any cycle sums to zero in shares and in cash", () => {
    const arbOrder = fc.record({
      participant: fc.constantFrom(A, B, C),
      side: fc.constantFrom("BUY", "SELL") as fc.Arbitrary<"BUY" | "SELL">,
      units: fc.bigInt({ min: 1n, max: 1_000_000n }),
    });
    fc.assert(
      fc.property(fc.array(arbOrder, { minLength: 1, maxLength: 20 }), fc.bigInt({ min: 1n, max: 1_000n * UNIT }), (orders, nav) => {
        const positions = netPositions(
          orders.map((o, i) => order(String(i), o.participant, o.side, o.units)),
          nav,
          FUND,
        );
        const shares = positions.reduce((sum, p) => sum + p.shares, 0n);
        const cash = positions.reduce((sum, p) => sum + p.cash, 0n);
        return shares === 0n && cash === 0n && positions.at(-1)?.participant === FUND;
      }),
    );
  });
});
