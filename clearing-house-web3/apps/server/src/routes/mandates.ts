import type { FastifyInstance } from "fastify";
import { mandateToText, type Mandate } from "@chw3/protocol";
import { mandateBodySchema } from "../schemas.ts";
import { verifyEip191 } from "../signatures.ts";
import type { Store } from "../store.ts";

export type StoredMandate = Omit<Mandate, "maxCashPerCycle"> & {
  maxCashPerCycle: string;
  signature: `0x${string}`;
  text: string;
  receivedAt: string;
};

const COLLECTION = "mandates";

export function listMandates(store: Store): StoredMandate[] {
  return store.read<StoredMandate>(COLLECTION);
}

// S-019: a mandate is stored only if the Flex signature matches its text.
// S-022: no signature or a signature from another key gives 401, a reused nonce 409.
export function registerMandateRoutes(app: FastifyInstance, store: Store) {
  app.get("/mandates", async () => listMandates(store));

  app.post("/mandates", async (request, reply) => {
    const parsed = mandateBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body", issues: parsed.error.issues });
    const { mandate, signature } = parsed.data;

    const text = mandateToText(mandate);
    if (!(await verifyEip191(mandate.participant, text, signature))) {
      return reply.code(401).send({ error: "signature does not match the mandate text" });
    }
    const replayed = listMandates(store).some(
      (stored) => stored.participant === mandate.participant && stored.nonce === mandate.nonce,
    );
    if (replayed) return reply.code(409).send({ error: "nonce already used" });

    const stored: StoredMandate = {
      ...mandate,
      maxCashPerCycle: mandate.maxCashPerCycle.toString(),
      signature,
      text,
      receivedAt: new Date().toISOString(),
    };
    store.append(COLLECTION, stored);
    return reply.code(201).send(stored);
  });
}
