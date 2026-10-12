// S-018: property tests on random cycles. Same invariants as the Foundry fuzz tests (S-013).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { checkCoverage } from "../src/coverage.ts";
import { netPositions } from "../src/netting.ts";
import { ONE_CASH, ONE_SHARE, type Address, type Balances, type Instruction, type Lot, type NetPosition } from "../src/types.ts";

const RUNS = 1_000;
const FUND: Address = "0x00000000000000000000000000000000000000F0";
// A small pool, so that participants often have several orders in one cycle
const PARTICIPANTS: Address[] = [
  "0x000000000000000000000000000000000000000A",
  "0x000000000000000000000000000000000000000B",
  "0x000000000000000000000000000000000000000C",
  "0x000000000000000000000000000000000000000D",
];
const MAX_SHARES = 1_000_000_000n * ONE_SHARE;
const MAX_NAV = 1_000_000n * ONE_CASH;
const MAX_ORDERS = 30;

const instructionArb: fc.Arbitrary<Instruction> = fc.record({
  id: fc.uuid(),
  cycleId: fc.constant("cycle"),
  fund: fc.constant(FUND),
  participant: fc.constantFrom(...PARTICIPANTS),
  side: fc.constantFrom("BUY" as const, "SELL" as const),
  // From 0.000001 share to one billion shares
  shares: fc.bigInt({ min: 1n, max: MAX_SHARES }),
});

const cycleArb = fc.record({
  instructions: fc.array(instructionArb, { maxLength: MAX_ORDERS }),
  navPerUnit: fc.bigInt({ min: 1n, max: MAX_NAV }),
});

function lotOf(positions: NetPosition[], navPerUnit: bigint): Lot {
  return { id: 1n, cycleId: "cycle", fund: FUND, navPerUnit, positions, instructionIds: [] };
}

// Exactly what each participant must deliver and pay, nothing more
function exactBalances(positions: NetPosition[]): Balances {
  const balances: Balances = {};
  for (const p of positions) {
    balances[p.participant] = { shares: p.shares < 0n ? -p.shares : 0n, cash: p.cash < 0n ? -p.cash : 0n };
  }
  return balances;
}

describe("netting properties (S-018)", () => {
  it("every lot sums to zero in shares", () => {
    fc.assert(
      fc.property(cycleArb, ({ instructions, navPerUnit }) => {
        const positions = netPositions(instructions, navPerUnit, FUND);
        expect(positions.reduce((sum, p) => sum + p.shares, 0n)).toBe(0n);
      }),
      { numRuns: RUNS },
    );
  });

  it("every lot sums to zero in cash", () => {
    fc.assert(
      fc.property(cycleArb, ({ instructions, navPerUnit }) => {
        const positions = netPositions(instructions, navPerUnit, FUND);
        expect(positions.reduce((sum, p) => sum + p.cash, 0n)).toBe(0n);
      }),
      { numRuns: RUNS },
    );
  });

  it("gives one line per participant, the fund last, and no empty line except the fund", () => {
    fc.assert(
      fc.property(cycleArb, ({ instructions, navPerUnit }) => {
        const positions = netPositions(instructions, navPerUnit, FUND);
        const participants = positions.map((p) => p.participant);
        expect(new Set(participants).size).toBe(participants.length);
        expect(participants.at(-1)).toBe(FUND);
        for (const p of positions.slice(0, -1)) expect(p.shares !== 0n || p.cash !== 0n).toBe(true);
      }),
      { numRuns: RUNS },
    );
  });
});

describe("coverage properties (S-018)", () => {
  it("accepts every lot when each participant holds exactly what it delivers and pays", () => {
    fc.assert(
      fc.property(cycleArb, ({ instructions, navPerUnit }) => {
        const positions = netPositions(instructions, navPerUnit, FUND);
        expect(checkCoverage(lotOf(positions, navPerUnit), exactBalances(positions))).toEqual([]);
      }),
      { numRuns: RUNS },
    );
  });

  it("flags a payer or deliverer as soon as one unit is missing", () => {
    fc.assert(
      fc.property(cycleArb, fc.nat(), ({ instructions, navPerUnit }, pick) => {
        const positions = netPositions(instructions, navPerUnit, FUND);
        const debtors = positions.filter((p) => p.shares < 0n || p.cash < 0n);
        fc.pre(debtors.length > 0);

        const debtor = debtors[pick % debtors.length]!;
        const balances = exactBalances(positions);
        const balance = balances[debtor.participant]!;
        balances[debtor.participant] =
          debtor.shares < 0n ? { ...balance, shares: balance.shares - 1n } : { ...balance, cash: balance.cash - 1n };

        expect(checkCoverage(lotOf(positions, navPerUnit), balances)).toEqual([debtor.participant]);
      }),
      { numRuns: RUNS },
    );
  });
});
