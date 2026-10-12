import { describe, expect, it } from "vitest";
import { instructionToText, mandateToText } from "@chw3/protocol";
import { testAccount, testServer } from "./helpers.ts";

const FUND = "0x3333333333333333333333333333333333333333" as const;
const HUNDRED_UNITS = (100n * 10n ** 6n).toString();

async function signedInstructionBody(account: ReturnType<typeof testAccount>, nonce = 1) {
  const instruction = {
    id: "a1b2c3",
    cycleId: "2026-10-12",
    fund: FUND,
    participant: account.address,
    side: "BUY" as const,
    shares: BigInt(HUNDRED_UNITS),
  };
  const payload = { instruction, fundName: "Fund F", participantName: "Manager A", nonce };
  const signature = await account.signMessage({ message: instructionToText(payload) });
  return { ...payload, instruction: { ...instruction, shares: HUNDRED_UNITS }, signature };
}

async function signMandate(app: ReturnType<typeof testServer>, account: ReturnType<typeof testAccount>) {
  const mandate = { participant: account.address, participantName: "Manager A", allowedFunds: ["Fund F"], maxCashPerCycle: 5_000_000n * 10n ** 6n, allowedSides: ["BUY", "SELL"] as ("BUY" | "SELL")[], nonce: 1 };
  const signature = await account.signMessage({ message: mandateToText(mandate) });
  await app.inject({ method: "POST", url: "/mandates", payload: { mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature } });
}

describe("POST /instructions (S-020, S-022, S-026)", () => {
  it("stores an instruction signed by its participant and inside its mandate", async () => {
    const app = testServer();
    const a = testAccount();
    await signMandate(app, a);
    const res = await app.inject({ method: "POST", url: "/instructions", payload: await signedInstructionBody(a) });
    expect(res.statusCode).toBe(201);
    expect(res.json().status).toBe("signed");
    expect(res.json().reasons).toEqual([]);
    expect(res.json().text).toContain("Subscribe 100 units");
    await app.close();
  });

  it("keeps a signed order without mandate as rejected, with the reason", async () => {
    const app = testServer();
    const res = await app.inject({ method: "POST", url: "/instructions", payload: await signedInstructionBody(testAccount()) });
    expect(res.statusCode).toBe(201);
    expect(res.json().status).toBe("rejected");
    expect(res.json().reasons).toEqual(["no signed mandate for this participant"]);
    await app.close();
  });

  it("rejects an instruction without signature with 400 and stores nothing", async () => {
    const app = testServer();
    const body: Partial<Awaited<ReturnType<typeof signedInstructionBody>>> = await signedInstructionBody(testAccount());
    delete body.signature;
    const res = await app.inject({ method: "POST", url: "/instructions", payload: body });
    expect(res.statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: "/instructions" })).json()).toHaveLength(0);
    await app.close();
  });

  it("rejects a signature from another account with 401", async () => {
    const app = testServer();
    const body = await signedInstructionBody(testAccount());
    body.instruction.participant = testAccount().address;
    const res = await app.inject({ method: "POST", url: "/instructions", payload: body });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("rejects an instruction changed after signature with 401", async () => {
    const app = testServer();
    const body = await signedInstructionBody(testAccount());
    body.instruction.shares = (1_000n * 10n ** 6n).toString();
    const res = await app.inject({ method: "POST", url: "/instructions", payload: body });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("rejects a replayed nonce with 409", async () => {
    const app = testServer();
    const body = await signedInstructionBody(testAccount());
    expect((await app.inject({ method: "POST", url: "/instructions", payload: body })).statusCode).toBe(201);
    expect((await app.inject({ method: "POST", url: "/instructions", payload: body })).statusCode).toBe(409);
    await app.close();
  });

  it("gives the next nonces per participant", async () => {
    const app = testServer();
    const a = testAccount();
    await app.inject({ method: "POST", url: "/instructions", payload: await signedInstructionBody(a, 1) });
    const res = await app.inject({ method: "GET", url: `/participants/${a.address}/nonces` });
    expect(res.json()).toEqual({ mandate: 1, instruction: 2 });
    await app.close();
  });
});
