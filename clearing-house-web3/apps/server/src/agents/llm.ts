import type { LlmConfig } from "./config.ts";

// Minimal client for an OpenAI compatible chat API (OpenRouter, D12).
// No SDK: one fetch, one JSON body, so the whole exchange is easy to read.

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolDefinition = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown>; strict?: boolean };
};

export type ChatResult = {
  content: string | null;
  toolCalls: ToolCall[];
  model: string;
};

export type LlmClient = {
  chat(model: string, messages: ChatMessage[], tools: ToolDefinition[]): Promise<ChatResult>;
};

export class LlmHttpError extends Error {
  constructor(
    readonly status: number,
    body: string,
  ) {
    super(`LLM API ${status}: ${body}`);
  }
}

export function createLlmClient(config: LlmConfig, fetchFn: typeof fetch = fetch): LlmClient {
  return {
    async chat(model, messages, tools) {
      const res = await fetchFn(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
          "x-title": "clearing-house-web3",
        },
        body: JSON.stringify({
          model,
          messages,
          tools,
          tool_choice: "auto",
          max_tokens: config.maxTokensPerCall,
          temperature: 0,
        }),
      });
      if (!res.ok) throw new LlmHttpError(res.status, await res.text());
      const body = (await res.json()) as {
        model?: string;
        choices: { message: { content: string | null; tool_calls?: ToolCall[] } }[];
      };
      const message = body.choices[0]?.message;
      return { content: message?.content ?? null, toolCalls: message?.tool_calls ?? [], model: body.model ?? model };
    },
  };
}
