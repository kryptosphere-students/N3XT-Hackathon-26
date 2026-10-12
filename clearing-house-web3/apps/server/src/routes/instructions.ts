import type { FastifyInstance } from "fastify";
import { instructionToText } from "@chw3/protocol";
import type { Instruction } from "@chw3/engine";
import { instructionBodySchema } from "../schemas.ts";
import { verifyEip191 } from "../signatures.ts";
import type { Store } from "../store.ts";
import { checkInstruction, cashOf } from "../engine-adapter.ts";
import { latestMandate } from "./mandates.ts";
import type { ServerConfig } from "./config.ts";

// signed: Flex signature valid and inside the mandate. rejected: valid signature but
// outside the mandate (S-026), kept for the audit trail. in_lot and settled: S-021.
export type InstructionStatus = "signed" | "rejected" | "in_lot" | "settled";

export type StoredInstruction = Omit<Instruction, "shares"> & {
  shares: string;
  fundName: string;
  participantName: string;
  nonce: number;
  signature: `0x${string}`;
  text: string;
  status: InstructionStatus;
  reasons: string[];
  lotId?: string;
  receivedAt: string;
};

const COLLECTION = "instructions";

export function listInstructions(store: Store): StoredInstruction[] {
  return store.read<StoredInstruction>(COLLECTION);
}

export function writeInstructions(store: Store, items: StoredInstruction[]) {
  store.write(COLLECTION, items);
}

// Cash already committed by a participant in a cycle: its signed BUY orders (D11, floored).
export function cashCommittedInCycle(store: Store, participant: string, cycleId: string, navPerUnit: bigint): bigint {
  return listInstructions(store)
    .filter((i) => i.participant.toLowerCase() === participant.toLowerCase() && i.cycleId === cycleId && i.status !== "rejected" && i.side === "BUY")
    .reduce((sum, i) => sum + cashOf(BigInt(i.shares), navPerUnit), 0n);
}

// S-020: an instruction enters the store only with a valid Flex signature on its text.
// S-022: 401 without a valid signature, 409 when the nonce was already used.
// S-026: then the mandate check, by code. A rejected order is stored with its reasons.
export function registerInstructionRoutes(app: FastifyInstance, store: Store, config: ServerConfig) {
  app.get("/instructions", async () => listInstructions(store));

  app.post("/instructions", async (request, reply) => {
    const parsed = instructionBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body", issues: parsed.error.issues });
    const { instruction, fundName, participantName, nonce, signature } = parsed.data;

    const text = instructionToText({ instruction, fundName, participantName, nonce });
    if (!(await verifyEip191(instruction.participant, text, signature))) {
      return reply.code(401).send({ error: "signature does not match the instruction text" });
    }
    const replayed = listInstructions(store).some(
      (stored) => stored.participant === instruction.participant && stored.nonce === nonce,
    );
    if (replayed) return reply.code(409).send({ error: "nonce already used" });

    const check = checkInstruction(instruction, latestMandate(store, instruction.participant), {
      navPerUnit: config.navPerUnit,
      cashCommittedInCycle: cashCommittedInCycle(store, instruction.participant, instruction.cycleId, config.navPerUnit),
      fundName,
    });

    const stored: StoredInstruction = {
      ...instruction,
      shares: instruction.shares.toString(),
      fundName,
      participantName,
      nonce,
      signature,
      text,
      status: check.ok ? "signed" : "rejected",
      reasons: check.reasons,
      receivedAt: new Date().toISOString(),
    };
    store.append(COLLECTION, stored);
    return reply.code(201).send(stored);
  });
}
