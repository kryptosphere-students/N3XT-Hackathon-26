import type { FastifyInstance } from "fastify";
import { instructionToText } from "@chw3/protocol";
import type { Instruction } from "@chw3/engine";
import { instructionBodySchema } from "../schemas.ts";
import { verifyEip191 } from "../signatures.ts";
import type { Store } from "../store.ts";

export type StoredInstruction = Omit<Instruction, "shares"> & {
  shares: string;
  fundName: string;
  participantName: string;
  nonce: number;
  signature: `0x${string}`;
  text: string;
  status: "signed";
  receivedAt: string;
};

const COLLECTION = "instructions";

export function listInstructions(store: Store): StoredInstruction[] {
  return store.read<StoredInstruction>(COLLECTION);
}

// S-020: an instruction enters the store only with a valid Flex signature on its text.
// S-022: 401 without a valid signature, 409 when the nonce was already used.
// TODO(S-026, Louis): call checkInstruction(instruction, mandate) from @chw3/engine here,
// after the signature check, and store the result with its reason.
export function registerInstructionRoutes(app: FastifyInstance, store: Store) {
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

    const stored: StoredInstruction = {
      ...instruction,
      shares: instruction.shares.toString(),
      fundName,
      participantName,
      nonce,
      signature,
      text,
      status: "signed",
      receivedAt: new Date().toISOString(),
    };
    store.append(COLLECTION, stored);
    return reply.code(201).send(stored);
  });
}
