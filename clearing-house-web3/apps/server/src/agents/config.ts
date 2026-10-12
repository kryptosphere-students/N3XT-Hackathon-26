// S-029: the LLM key and models come from .env, never from the code.
// Every call is capped in tokens, so a loop cannot burn the budget.
export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  fallbackModel: string;
  maxTokensPerCall: number;
};

export const MAX_TOKENS_PER_CALL = 500;

export function llmConfigFromEnv(env: NodeJS.ProcessEnv): LlmConfig {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing in .env");
  return {
    apiKey,
    baseUrl: env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1",
    model: env.LLM_MODEL ?? "deepseek/deepseek-v4.1-flash",
    fallbackModel: env.LLM_FALLBACK_MODEL ?? "qwen/qwen3.7-flash",
    maxTokensPerCall: MAX_TOKENS_PER_CALL,
  };
}
