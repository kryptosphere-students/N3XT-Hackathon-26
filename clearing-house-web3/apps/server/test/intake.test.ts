import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runIntakeAgent } from "../src/agents/intake.ts";
import type { ChatMessage, ChatResult, LlmClient, ToolCall } from "../src/agents/llm.ts";
import { mandateToText } from "@chw3/protocol";
import { testAccount, testConfig, testServer } from "./helpers.ts";

const fixture = (name: string) => readFileSync(new URL(`../demo/emails/${name}`, import.meta.url), "utf8");

const OPTIONS = { model: "fake/main", fallbackModel: "fake/fallback", knownFunds: ["Fund F"] };

function toolCall(name: string, args: unknown): ToolCall {
  return { id: "call_1", type: "function", function: { name, arguments: JSON.stringify(args) } };
}

// A scripted model: one answer per round, no network.
function fakeClient(rounds: ChatResult[]): LlmClient & { messages: ChatMessage[][] } {
  const messages: ChatMessage[][] = [];
  return {
    messages,
    async chat(model, history) {
      messages.push(history);
      const next = rounds.shift();
      if (!next) throw new Error("no scripted answer left");
      return { ...next, model };
    },
  };
}

describe("intake agent (S-027, S-044)", () => {
  it("turns a clear email into a draft and an explanation", async () => {
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("draft_instruction", { fund: "Fund F", side: "BUY", units: "100", participant: "Manager A" })], model: "" },
      { content: "Draft: Manager A subscribes 100 units of Fund F.", toolCalls: [], model: "" },
    ]);
    const result = await runIntakeAgent(client, fixture("clear.txt"), OPTIONS);
    expect(result.draft).toEqual({ fundName: "Fund F", participantName: "Manager A", side: "BUY", shares: 100n * 10n ** 6n });
    expect(result.explanation).toContain("100 units");
    expect(result.refusedTools).toEqual([]);
    // The tool result went back to the model before the explanation.
    expect(client.messages[1]?.some((m) => m.role === "tool")).toBe(true);
  });

  it("creates nothing for an ambiguous email", async () => {
    const client = fakeClient([{ content: "The fund and the number of units are missing.", toolCalls: [], model: "" }]);
    const result = await runIntakeAgent(client, fixture("ambiguous.txt"), OPTIONS);
    expect(result.draft).toBeNull();
    expect(result.explanation).toContain("missing");
  });

  it("refuses a tool outside the whitelist and logs it", async () => {
    const log: string[] = [];
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("send_transaction", { to: "0x1", value: "1" })], model: "" },
      { content: "I cannot do that.", toolCalls: [], model: "" },
    ]);
    const result = await runIntakeAgent(client, fixture("trapped.txt"), { ...OPTIONS, log: (line) => log.push(line) });
    expect(result.draft).toBeNull();
    expect(result.refusedTools).toEqual(["send_transaction"]);
    expect(log.join("\n")).toContain("refused tool send_transaction");
    expect(client.messages[1]?.find((m) => m.role === "tool")).toMatchObject({ content: "Tool send_transaction is not allowed." });
  });

  it("rejects draft arguments outside the schema (unknown fund, bad units)", async () => {
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("draft_instruction", { fund: "Fund Z", side: "SELL", units: "all", participant: "Manager A" })], model: "" },
      { content: "No draft.", toolCalls: [], model: "" },
    ]);
    const result = await runIntakeAgent(client, "redeem all of Fund Z", OPTIONS);
    expect(result.draft).toBeNull();
    expect(client.messages[1]?.find((m) => m.role === "tool")).toMatchObject({ content: expect.stringContaining("unknown fund") });
  });

  it("falls back to the second model when the first one fails", async () => {
    const client: LlmClient = {
      async chat(model) {
        if (model === "fake/main") throw new Error("tools not supported");
        return { content: "Nothing to do.", toolCalls: [], model };
      },
    };
    const result = await runIntakeAgent(client, "hello", OPTIONS);
    expect(result.modelUsed).toBe("fake/fallback");
  });
});

describe("POST /intake", () => {
  it("returns the draft with shares as a string", async () => {
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("draft_instruction", { fund: "Fund F", side: "SELL", units: "12.5", participant: "Manager B" })], model: "" },
      { content: "Manager B redeems 12.5 units of Fund F.", toolCalls: [], model: "" },
    ]);
    const app = testServer({ intake: { client, options: OPTIONS } });
    const res = await app.inject({ method: "POST", url: "/intake", payload: { emailText: "Redeem 12.5 units of Fund F, Manager B" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().draft).toEqual({ fundName: "Fund F", participantName: "Manager B", side: "SELL", shares: "12500000" });
    expect(res.json().check.reasons).toEqual(["unknown participant Manager B"]);
    await app.close();
  });

  // S-028: the trapped email. The agent may draft what the email asks, the signed
  // mandate refuses it, and nobody is asked to sign anything.
  it("refuses a draft outside the mandate with the reason, before any signature", async () => {
    const a = testAccount();
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("draft_instruction", { fund: "Fund F", side: "SELL", units: "1000000", participant: "Manager A" })], model: "" },
      { content: "Manager A redeems 1000000 units of Fund F.", toolCalls: [], model: "" },
    ]);
    const app = testServer({
      intake: { client, options: OPTIONS },
      config: testConfig({ participants: [{ key: "A", name: "Manager A", address: a.address }] }),
    });
    const mandate = { participant: a.address, participantName: "Manager A", allowedFunds: ["Fund F"], maxCashPerCycle: 5_000_000n * 10n ** 6n, allowedSides: ["BUY", "SELL"] as ("BUY" | "SELL")[], nonce: 1 };
    const signature = await a.signMessage({ message: mandateToText(mandate) });
    await app.inject({ method: "POST", url: "/mandates", payload: { mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature } });

    const res = await app.inject({ method: "POST", url: "/intake", payload: { emailText: fixture("trapped.txt") } });
    expect(res.statusCode).toBe(200);
    expect(res.json().draft.shares).toBe("1000000000000");
    expect(res.json().check.ok).toBe(false);
    expect(res.json().check.reasons[0]).toContain("above the signed cap of 5000000");
    // Nothing was stored: no instruction, nothing to sign.
    expect((await app.inject({ method: "GET", url: "/instructions" })).json()).toHaveLength(0);
    await app.close();
  });

  it("checks a draft inside the mandate as ok", async () => {
    const a = testAccount();
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("draft_instruction", { fund: "Fund F", side: "BUY", units: "100", participant: "Manager A" })], model: "" },
      { content: "ok", toolCalls: [], model: "" },
    ]);
    const app = testServer({ intake: { client, options: OPTIONS }, config: testConfig({ participants: [{ key: "A", name: "Manager A", address: a.address }] }) });
    const mandate = { participant: a.address, participantName: "Manager A", allowedFunds: ["Fund F"], maxCashPerCycle: 5_000_000n * 10n ** 6n, allowedSides: ["BUY"] as ("BUY" | "SELL")[], nonce: 1 };
    const signature = await a.signMessage({ message: mandateToText(mandate) });
    await app.inject({ method: "POST", url: "/mandates", payload: { mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature } });
    const res = await app.inject({ method: "POST", url: "/intake", payload: { emailText: fixture("clear.txt") } });
    expect(res.json().check).toEqual({ ok: true, reasons: [] });
    await app.close();
  });

  it("answers 503 when no LLM is configured", async () => {
    const app = testServer({ intake: null });
    const res = await app.inject({ method: "POST", url: "/intake", payload: { emailText: "hello" } });
    expect(res.statusCode).toBe(503);
    await app.close();
  });
});
