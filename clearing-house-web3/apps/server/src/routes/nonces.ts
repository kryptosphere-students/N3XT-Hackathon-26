import type { FastifyInstance } from "fastify";
import { addressSchema } from "../schemas.ts";
import type { Store } from "../store.ts";
import { listMandates } from "./mandates.ts";
import { listInstructions } from "./instructions.ts";

// Next nonce to put in a text before signing it. Small numbers read well on the Flex.
export function registerNonceRoutes(app: FastifyInstance, store: Store) {
  app.get("/participants/:address/nonces", async (request, reply) => {
    const parsed = addressSchema.safeParse((request.params as { address: string }).address);
    if (!parsed.success) return reply.code(400).send({ error: "invalid address" });
    const address = parsed.data;
    const same = (stored: { participant: string }) => stored.participant.toLowerCase() === address.toLowerCase();
    return {
      mandate: listMandates(store).filter(same).length + 1,
      instruction: listInstructions(store).filter(same).length + 1,
    };
  });
}
