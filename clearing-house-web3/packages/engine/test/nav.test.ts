import { parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import fixture from "../fixtures/nav-fund-f.json" with { type: "json" };
import { computeNav, navHash, navInputsFromJson } from "../src/nav.ts";
import { CASH_DECIMALS, ONE_CASH, ONE_SHARE } from "../src/types.ts";

const INPUTS = navInputsFromJson(fixture);

describe("navInputsFromJson (S-024)", () => {
  it("reads the Fund F fixture into bigint amounts with 6 decimals", () => {
    expect(INPUTS).toEqual({
      fundName: "Fund F",
      navDate: "2026-10-13",
      source: "mock fund administrator",
      holdings: [
        { asset: "EUR government bond 2030", quantity: 60_000n * ONE_SHARE, price: 101_250_000n },
        { asset: "Cash at depositary", quantity: 4_525_000n * ONE_SHARE, price: ONE_CASH },
      ],
      liabilities: 100_000n * ONE_CASH,
      sharesOutstanding: 100_000n * ONE_SHARE,
    });
  });

  it("refuses an amount that is not a positive decimal number", () => {
    expect(() => navInputsFromJson({ ...fixture, liabilities: "-1" })).toThrow(/liabilities/);
    expect(() => navInputsFromJson({ ...fixture, sharesOutstanding: "abc" })).toThrow(/sharesOutstanding/);
  });
});

describe("computeNav (S-041)", () => {
  it("gives 105.000000 for Fund F, the NAV published in the fixture", () => {
    // (6 075 000 + 4 525 000 - 100 000) / 100 000 = 105
    expect(computeNav(INPUTS)).toBe(105n * ONE_CASH);
    expect(computeNav(INPUTS)).toBe(parseUnits(fixture.navPerUnit, CASH_DECIMALS));
  });

  it("rounds down to the cash unit", () => {
    // 10 cash for 3 shares: 3.333333…, floored to 3.333333
    const inputs = { ...INPUTS, holdings: [{ asset: "Cash", quantity: 10n * ONE_SHARE, price: ONE_CASH }], liabilities: 0n, sharesOutstanding: 3n * ONE_SHARE };
    expect(computeNav(inputs)).toBe(3_333_333n);
  });

  it("refuses a fund with no shares or with more liabilities than assets", () => {
    expect(() => computeNav({ ...INPUTS, sharesOutstanding: 0n })).toThrow(/shares/);
    expect(() => computeNav({ ...INPUTS, liabilities: 20_000_000n * ONE_CASH })).toThrow(/liabilities/);
  });
});

describe("navHash (S-041)", () => {
  it("is stable for the same inputs", () => {
    expect(navHash(INPUTS)).toBe(navHash(navInputsFromJson(fixture)));
    expect(navHash(INPUTS)).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("changes when any input changes", () => {
    const reference = navHash(INPUTS);
    const changed = [
      { ...INPUTS, fundName: "Fund G" },
      { ...INPUTS, navDate: "2026-10-12" },
      { ...INPUTS, source: "another administrator" },
      { ...INPUTS, liabilities: INPUTS.liabilities + 1n },
      { ...INPUTS, sharesOutstanding: INPUTS.sharesOutstanding + 1n },
      { ...INPUTS, holdings: [{ ...INPUTS.holdings[0]!, price: 101_250_001n }, INPUTS.holdings[1]!] },
      { ...INPUTS, holdings: [...INPUTS.holdings].reverse() },
    ];

    for (const inputs of changed) expect(navHash(inputs)).not.toBe(reference);
  });
});
