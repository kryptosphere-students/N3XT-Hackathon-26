import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runIntakeAgent } from "../src/agents/intake.ts";
import type { ChatMessage, ChatResult, LlmClient, ToolCall } from "../src/agents/llm.ts";
import { buildServer } from "../src/app.ts";
import { createStore } from "../src/store.ts";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

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
    const result = await runIntakeAgent(client, fixture("email-clear.txt"), OPTIONS);
    expect(result.draft).toEqual({ fundName: "Fund F", participantName: "Manager A", side: "BUY", shares: 100n * 10n ** 6n });
    expect(result.explanation).toContain("100 units");
    expect(result.refusedTools).toEqual([]);
    // The tool result went back to the model before the explanation.
    expect(client.messages[1]?.some((m) => m.role === "tool")).toBe(true);
  });

  it("creates nothing for an ambiguous email", async () => {
    const client = fakeClient([{ content: "The fund and the number of units are missing.", toolCalls: [], model: "" }]);
    const result = await runIntakeAgent(client, fixture("email-ambiguous.txt"), OPTIONS);
    expect(result.draft).toBeNull();
    expect(result.explanation).toContain("missing");
  });

  it("refuses a tool outside the whitelist and logs it", async () => {
    const log: string[] = [];
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("send_transaction", { to: "0x1", value: "1" })], model: "" },
      { content: "I cannot do that.", toolCalls: [], model: "" },
    ]);
    const result = await runIntakeAgent(client, fixture("email-trapped.txt"), { ...OPTIONS, log: (line) => log.push(line) });
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
  const config = { funds: [{ name: "Fund F", address: "0x3333333333333333333333333333333333333333" as const }] };

  it("returns the draft with shares as a string", async () => {
    const client = fakeClient([
      { content: null, toolCalls: [toolCall("draft_instruction", { fund: "Fund F", side: "SELL", units: "12.5", participant: "Manager B" })], model: "" },
      { content: "Manager B redeems 12.5 units of Fund F.", toolCalls: [], model: "" },
    ]);
    const app = buildServer(createStore(mkdtempSync(join(tmpdir(), "chw3-"))), config, { client, options: OPTIONS });
    const res = await app.inject({ method: "POST", url: "/intake", payload: { emailText: "Redeem 12.5 units of Fund F, Manager B" } });
    expect(res.statusCode).toBe(200);
    expect(res.json().draft).toEqual({ fundName: "Fund F", participantName: "Manager B", side: "SELL", shares: "12500000" });
    await app.close();
  });

  it("answers 503 when no LLM is configured", async () => {
    const app = buildServer(createStore(mkdtempSync(join(tmpdir(), "chw3-"))), config, null);
    const res = await app.inject({ method: "POST", url: "/intake", payload: { emailText: "hello" } });
    expect(res.statusCode).toBe(503);
    await app.close();
  });
});
