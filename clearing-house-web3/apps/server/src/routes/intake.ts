import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { runIntakeAgent, type IntakeOptions } from "../agents/intake.ts";
import type { LlmClient } from "../agents/llm.ts";

const MAX_EMAIL_CHARS = 4000;

const intakeBodySchema = z.object({ emailText: z.string().min(1).max(MAX_EMAIL_CHARS) });

export type IntakeDeps = { client: LlmClient; options: IntakeOptions };

// S-044: POST /intake { emailText } returns a draft (or null) and a short explanation.
export function registerIntakeRoutes(app: FastifyInstance, deps: IntakeDeps | null) {
  app.post("/intake", async (request, reply) => {
    if (!deps) return reply.code(503).send({ error: "LLM not configured (OPENROUTER_API_KEY missing)" });
    const parsed = intakeBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body", issues: parsed.error.issues });

    const result = await runIntakeAgent(deps.client, parsed.data.emailText, deps.options);
    return {
      ...result,
      draft: result.draft && { ...result.draft, shares: result.draft.shares.toString() },
    };
  });
}
