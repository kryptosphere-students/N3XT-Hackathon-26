import { describe, expect, it } from "vitest";
import { mandateToText, type Mandate } from "@chw3/protocol";
import { testAccount, testServer } from "./helpers.ts";

const FIVE_MILLION = (5_000_000n * 10n ** 6n).toString();

async function signedMandateBody(account: ReturnType<typeof testAccount>, nonce = 1) {
  const mandate: Mandate = {
    participant: account.address,
    participantName: "Manager A",
    allowedFunds: ["Fund F"],
    maxCashPerCycle: BigInt(FIVE_MILLION),
    allowedSides: ["BUY", "SELL"],
    nonce,
  };
  const signature = await account.signMessage({ message: mandateToText(mandate) });
  return { mandate: { ...mandate, maxCashPerCycle: FIVE_MILLION }, signature };
}

describe("POST /mandates (S-019, S-022)", () => {
  it("stores a mandate signed by its participant", async () => {
    const app = testServer();
    const a = testAccount();
    const res = await app.inject({ method: "POST", url: "/mandates", payload: await signedMandateBody(a) });
    expect(res.statusCode).toBe(201);
    expect(res.json().text).toContain("Max per cycle: 5000000 cash");

    const list = await app.inject({ method: "GET", url: "/mandates" });
    expect(list.json()).toHaveLength(1);
    await app.close();
  });

  it("rejects a signature from another account with 401", async () => {
    const app = testServer();
    const body = await signedMandateBody(testAccount());
    body.mandate.participant = testAccount().address;
    const res = await app.inject({ method: "POST", url: "/mandates", payload: body });
    expect(res.statusCode).toBe(401);
    expect((await app.inject({ method: "GET", url: "/mandates" })).json()).toHaveLength(0);
    await app.close();
  });

  it("rejects a mandate changed after signature with 401", async () => {
    const app = testServer();
    const body = await signedMandateBody(testAccount());
    body.mandate.maxCashPerCycle = (9_000_000n * 10n ** 6n).toString();
    const res = await app.inject({ method: "POST", url: "/mandates", payload: body });
    expect(res.statusCode).toBe(401);
    await app.close();
  });

  it("rejects a missing or malformed signature with 400", async () => {
    const app = testServer();
    const body = await signedMandateBody(testAccount());
    const res = await app.inject({ method: "POST", url: "/mandates", payload: { mandate: body.mandate } });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it("rejects a replayed nonce with 409", async () => {
    const app = testServer();
    const a = testAccount();
    const body = await signedMandateBody(a);
    expect((await app.inject({ method: "POST", url: "/mandates", payload: body })).statusCode).toBe(201);
    expect((await app.inject({ method: "POST", url: "/mandates", payload: body })).statusCode).toBe(409);
    expect((await app.inject({ method: "POST", url: "/mandates", payload: await signedMandateBody(a, 2) })).statusCode).toBe(201);
    await app.close();
  });
});
