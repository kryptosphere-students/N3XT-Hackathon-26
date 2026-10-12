import { describe, expect, it } from "vitest";
import type { Hex } from "viem";
import { ONE_CASH } from "@chw3/engine";
import { instructionToText, lotApprovalToText, mandateToText } from "@chw3/protocol";
import type { Chain } from "../src/chain.ts";
import { toLot } from "../src/routes/lots.ts";
import { TEST_FUND, testAccount, testServer } from "./helpers.ts";

type Account = ReturnType<typeof testAccount>;
type App = ReturnType<typeof testServer>;

const SHARE_TOKEN = "0x16c97EfC46019D42ab6CdDa5dAd70C6A96568a69" as const;
const CASH_TOKEN = "0xCd0e0EAf78435fdC882dE50833adaFCB5951a27A" as const;
const CYCLE = "2026-10-13";
const UNIT = 10n ** 6n;

// A chain that records settle calls instead of sending them.
function fakeChain(options: { short?: `0x${string}`[] } = {}): Chain & { settled: { lotId: bigint; signatures: Hex[] }[] } {
  const settled: { lotId: bigint; signatures: Hex[] }[] = [];
  return {
    settled,
    shareToken: SHARE_TOKEN,
    cashToken: CASH_TOKEN,
    async settle(lot, _navHash, signatures) {
      settled.push({ lotId: lot.id, signatures });
      return "0xabc";
    },
    async balances(participants) {
      const plenty = { shares: 1_000_000n * UNIT, cash: 1_000_000_000n * ONE_CASH };
      const none = { shares: 0n, cash: 0n };
      return Object.fromEntries(participants.map((p) => [p, options.short?.includes(p) ? none : plenty]));
    },
    async isSettled(lotId) {
      return settled.some((s) => s.lotId === lotId);
    },
    explorerTxUrl: () => null,
  };
}

async function signMandate(app: App, account: Account, name: string) {
  const mandate = { participant: account.address, participantName: name, allowedFunds: ["Fund F"], maxCashPerCycle: 5_000_000n * ONE_CASH, allowedSides: ["BUY", "SELL"] as ("BUY" | "SELL")[], nonce: 1 };
  const signature = await account.signMessage({ message: mandateToText(mandate) });
  const res = await app.inject({ method: "POST", url: "/mandates", payload: { mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature } });
  expect(res.statusCode).toBe(201);
}

async function signOrder(app: App, account: Account, name: string, id: string, side: "BUY" | "SELL", units: bigint, nonce: number) {
  const instruction = { id, cycleId: CYCLE, fund: TEST_FUND, participant: account.address, side, shares: units * UNIT };
  const payload = { instruction, fundName: "Fund F", participantName: name, nonce };
  const signature = await account.signMessage({ message: instructionToText(payload) });
  const res = await app.inject({ method: "POST", url: "/instructions", payload: { ...payload, instruction: { ...instruction, shares: instruction.shares.toString() }, signature } });
  expect(res.statusCode).toBe(201);
  return res.json();
}

async function approve(app: App, lotId: string, account: Account, text?: string) {
  const lot = (await app.inject({ method: "GET", url: `/lots/${lotId}` })).json();
  const message = text ?? lot.texts[account.address];
  const signature = await account.signMessage({ message });
  return app.inject({ method: "POST", url: `/lots/${lotId}/approvals`, payload: { participant: account.address, signature } });
}

async function cycleWithTwoOrders(chain: Chain) {
  const app = testServer({ chain });
  const a = testAccount();
  const b = testAccount();
  await signMandate(app, a, "Manager A");
  await signMandate(app, b, "Manager B");
  await signOrder(app, a, "Manager A", "o1", "BUY", 100n, 1);
  await signOrder(app, b, "Manager B", "o2", "SELL", 40n, 1);
  return { app, a, b };
}

describe("lots (S-021, S-042)", () => {
  it("nets the cycle, lists the approvers and the texts to sign, shows gross against net", async () => {
    const chain = fakeChain();
    const { app, a, b } = await cycleWithTwoOrders(chain);
    const res = await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "netting" } });
    expect(res.statusCode).toBe(201);
    const lot = res.json();
    expect(lot.status).toBe("pending");
    expect(lot.approvers).toEqual([a.address, b.address]);
    expect(lot.texts[a.address]).toContain("You receive 100 units");
    expect(lot.texts[b.address]).toContain("You deliver 40 units");
    expect(lot.gross).toEqual({ shares: (140n * UNIT).toString(), cash: (14_700n * ONE_CASH).toString() });
    expect(lot.net).toEqual({ shares: (60n * UNIT).toString(), cash: (6_300n * ONE_CASH).toString() });
    expect(lot.lotHash).toMatch(/^0x[0-9a-f]{64}$/);
    // The lot text carries the same hash the contract will emit.
    expect(lotApprovalToText(toLot(lot), a.address, { fundName: "Fund F", lotHash: lot.lotHash })).toBe(lot.texts[a.address]);

    const orders = (await app.inject({ method: "GET", url: "/instructions" })).json();
    expect(orders.every((o: { status: string; lotId: string }) => o.status === "in_lot" && o.lotId === lot.id)).toBe(true);
    await app.close();
  });

  it("settles only once every approver has signed, then marks the orders settled", async () => {
    const chain = fakeChain();
    const { app, a, b } = await cycleWithTwoOrders(chain);
    const lot = (await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "netting" } })).json();

    const first = await approve(app, lot.id, a);
    expect(first.statusCode).toBe(201);
    expect(first.json().status).toBe("pending");
    expect(first.json().missing).toEqual([b.address]);
    expect(chain.settled).toHaveLength(0);

    const second = await approve(app, lot.id, b);
    expect(second.json().status).toBe("settled");
    expect(second.json().txHash).toBe("0xabc");
    expect(chain.settled).toEqual([{ lotId: 1n, signatures: [first.json().approvals[0].signature, second.json().approvals[1].signature] }]);

    const orders = (await app.inject({ method: "GET", url: "/instructions" })).json();
    expect(orders.every((o: { status: string }) => o.status === "settled")).toBe(true);
    await app.close();
  });

  it("refuses a wrong or foreign approval before any transaction", async () => {
    const chain = fakeChain();
    const { app, a, b } = await cycleWithTwoOrders(chain);
    const lot = (await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "netting" } })).json();

    const tampered = await approve(app, lot.id, a, lot.texts[a.address].replace("100 units", "1000 units"));
    expect(tampered.statusCode).toBe(401);

    const stranger = testAccount();
    const foreign = await approve(app, lot.id, stranger, lot.texts[a.address]);
    expect(foreign.statusCode).toBe(403);

    const retry = await app.inject({ method: "POST", url: `/lots/${lot.id}/settle` });
    expect(retry.statusCode).toBe(409);
    expect(retry.json().participants).toEqual([a.address, b.address]);
    expect(chain.settled).toHaveLength(0);
    await app.close();
  });

  it("instant mode settles one order as a lot of two lines", async () => {
    const chain = fakeChain();
    const { app, a } = await cycleWithTwoOrders(chain);
    const res = await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "instant", instructionId: "o1" } });
    expect(res.statusCode).toBe(201);
    const lot = res.json();
    expect(lot.mode).toBe("instant");
    expect(lot.positions).toHaveLength(2);
    expect(lot.approvers).toEqual([a.address]);
    const done = await approve(app, lot.id, a);
    expect(done.json().status).toBe("settled");
    // The second order is still available for a later lot.
    const orders = (await app.inject({ method: "GET", url: "/instructions" })).json();
    expect(orders.find((o: { id: string }) => o.id === "o2").status).toBe("signed");
    await app.close();
  });

  it("refuses a lot that a participant cannot cover", async () => {
    const chain = fakeChain({ short: [] });
    const { app, a } = await cycleWithTwoOrders(chain);
    chain.balances = async (participants) => Object.fromEntries(participants.map((p) => [p, p === a.address ? { shares: 0n, cash: 0n } : { shares: 10n ** 12n, cash: 10n ** 15n }]));
    const res = await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "netting" } });
    expect(res.statusCode).toBe(409);
    expect(res.json().participants).toEqual([a.address]);
    await app.close();
  });

  it("stores a rejected order outside the mandate and keeps it out of lots (S-026)", async () => {
    const app = testServer({ chain: fakeChain() });
    const a = testAccount();
    await signMandate(app, a, "Manager A");
    const rejected = await signOrder(app, a, "Manager A", "big", "SELL", 1_000_000n, 1);
    expect(rejected.status).toBe("rejected");
    expect(rejected.reasons[0]).toContain("above the signed cap");
    const res = await app.inject({ method: "POST", url: `/cycles/${CYCLE}/lots`, payload: { mode: "netting" } });
    expect(res.statusCode).toBe(409);
    await app.close();
  });
});
