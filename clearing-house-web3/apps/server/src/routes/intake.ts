import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { runIntakeAgent, type Draft, type IntakeOptions } from "../agents/intake.ts";
import type { LlmClient } from "../agents/llm.ts";
import { checkInstruction, type InstructionCheck } from "../engine-adapter.ts";
import type { Store } from "../store.ts";
import type { ServerConfig } from "./config.ts";
import { cashCommittedInCycle } from "./instructions.ts";
import { latestMandate } from "./mandates.ts";

const MAX_EMAIL_CHARS = 4000;

const intakeBodySchema = z.object({ emailText: z.string().min(1).max(MAX_EMAIL_CHARS), cycleId: z.string().min(1).max(40).optional() });

export type IntakeDeps = { client: LlmClient; options: IntakeOptions };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// S-028: the draft goes through the mandate check before anyone is asked to sign.
// A refused draft never reaches the Flex: the browser only shows the reasons.
export function checkDraft(store: Store, config: ServerConfig, draft: Draft, cycleId: string): InstructionCheck {
  const participant = config.participants.find((p) => p.name.toLowerCase() === draft.participantName.toLowerCase());
  if (!participant) return { ok: false, reasons: [`unknown participant ${draft.participantName}`] };
  const fund = config.funds.find((f) => f.name === draft.fundName);
  if (!fund) return { ok: false, reasons: [`unknown fund ${draft.fundName}`] };
  const instruction = { id: "draft", cycleId, fund: fund.address, participant: participant.address, side: draft.side, shares: draft.shares };
  return checkInstruction(instruction, latestMandate(store, participant.address), {
    navPerUnit: config.navPerUnit,
    cashCommittedInCycle: cashCommittedInCycle(store, participant.address, cycleId, config.navPerUnit),
    fundName: draft.fundName,
  });
}

// S-044: POST /intake { emailText } returns a draft (or null), a short explanation
// and the mandate check of the draft.
export function registerIntakeRoutes(app: FastifyInstance, store: Store, config: ServerConfig, deps: IntakeDeps | null) {
  app.post("/intake", async (request, reply) => {
    if (!deps) return reply.code(503).send({ error: "LLM not configured (OPENROUTER_API_KEY missing)" });
    const parsed = intakeBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body", issues: parsed.error.issues });

    const result = await runIntakeAgent(deps.client, parsed.data.emailText, deps.options);
    const check = result.draft ? checkDraft(store, config, result.draft, parsed.data.cycleId ?? today()) : null;
    return {
      ...result,
      draft: result.draft && { ...result.draft, shares: result.draft.shares.toString() },
      check,
    };
  });
}
