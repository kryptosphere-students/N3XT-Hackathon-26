import { parseUnits } from "viem";
import { SHARE_DECIMALS, type Side } from "@chw3/engine";
import type { ChatMessage, LlmClient, ToolCall } from "./llm.ts";
import { INTAKE_SYSTEM_PROMPT } from "./prompts.ts";
import { DRAFT_INSTRUCTION, WHITELISTED_TOOLS, draftInstructionArgsSchema } from "./tools.ts";

// S-044: email in, draft out. The draft is not signed and never enters a lot
// by itself: the manager signs it on the Flex (S-020) after the mandate check (S-026).
export type Draft = {
  fundName: string;
  participantName: string;
  side: Side;
  // 6 decimals, converted by our code from the units string the model extracted
  shares: bigint;
};

export type IntakeResult = {
  draft: Draft | null;
  explanation: string;
  modelUsed: string;
  refusedTools: string[];
};

export type IntakeOptions = {
  model: string;
  fallbackModel: string;
  knownFunds: string[];
  systemPrompt?: string;
  log?: (line: string) => void;
};

const MAX_ROUNDS = 2;

export async function runIntakeAgent(client: LlmClient, emailText: string, options: IntakeOptions): Promise<IntakeResult> {
  try {
    return await intakeWith(client, options.model, emailText, options);
  } catch (error) {
    options.log?.(`intake: ${options.model} failed (${String(error)}), trying ${options.fallbackModel}`);
    return intakeWith(client, options.fallbackModel, emailText, options);
  }
}

async function intakeWith(client: LlmClient, model: string, emailText: string, options: IntakeOptions): Promise<IntakeResult> {
  const argsSchema = draftInstructionArgsSchema(options.knownFunds);
  const messages: ChatMessage[] = [
    { role: "system", content: options.systemPrompt ?? INTAKE_SYSTEM_PROMPT },
    { role: "user", content: emailText },
  ];
  let draft: Draft | null = null;
  const refusedTools: string[] = [];
  let explanation = "";
  let modelUsed = model;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const result = await client.chat(model, messages, WHITELISTED_TOOLS);
    modelUsed = result.model;
    if (result.toolCalls.length === 0) {
      explanation = result.content ?? "";
      break;
    }
    messages.push({ role: "assistant", content: result.content, tool_calls: result.toolCalls });
    for (const call of result.toolCalls) {
      messages.push({ role: "tool", tool_call_id: call.id, content: handleToolCall(call) });
    }
  }
  return { draft, explanation, modelUsed, refusedTools };

  // Whitelist first, schema second. Anything else is refused and logged, never executed.
  function handleToolCall(call: ToolCall): string {
    if (call.function.name !== DRAFT_INSTRUCTION) {
      refusedTools.push(call.function.name);
      options.log?.(`intake: refused tool ${call.function.name}`);
      return `Tool ${call.function.name} is not allowed.`;
    }
    const parsed = argsSchema.safeParse(parseJson(call.function.arguments));
    if (!parsed.success) {
      options.log?.(`intake: invalid draft_instruction arguments: ${parsed.error.message}`);
      return `Invalid arguments: ${parsed.error.issues.map((issue) => issue.message).join(", ")}. No draft created.`;
    }
    if (draft) return "A draft already exists for this email. Nothing created.";
    draft = {
      fundName: parsed.data.fund,
      participantName: parsed.data.participant,
      side: parsed.data.side,
      shares: parseUnits(parsed.data.units, SHARE_DECIMALS),
    };
    return `Draft created: ${parsed.data.side} ${parsed.data.units} units of ${parsed.data.fund} for ${parsed.data.participant}. It still needs the mandate check and the manager's signature on the Ledger.`;
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
