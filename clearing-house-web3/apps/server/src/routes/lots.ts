import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Hex } from "viem";
import type { Address, Lot, NetPosition } from "@chw3/engine";
import { lotApprovalToText } from "@chw3/protocol";
import type { Chain } from "../chain.ts";
import { checkCoverage, lotHash, navHash, netPositions } from "../engine-adapter.ts";
import { addressSchema, hexSchema } from "../schemas.ts";
import { verifyEip191 } from "../signatures.ts";
import type { Store } from "../store.ts";
import type { ServerConfig } from "./config.ts";
import { listInstructions, writeInstructions, type StoredInstruction } from "./instructions.ts";

// S-021, S-042. A lot is built from signed orders (netting: the whole cycle,
// instant: one order), approved by each participant on the Flex, then settled
// by the engine key. The fund's line needs no approval: the fund is operated
// by the clearing house, its account is the deployer.
export type LotStatus = "pending" | "approved" | "settled" | "failed";

export type StoredPosition = { participant: Address; shares: string; cash: string };

export type StoredLot = {
  id: string;
  cycleId: string;
  mode: "netting" | "instant";
  fund: Address;
  fundName: string;
  navPerUnit: string;
  navHash: Hex;
  positions: StoredPosition[];
  instructionIds: string[];
  lotHash: Hex;
  // Participants whose approval is needed, the fund excluded
  approvers: Address[];
  approvals: { participant: Address; signature: Hex; text: string; receivedAt: string }[];
  status: LotStatus;
  txHash?: Hex;
  explorerUrl?: string | null;
  error?: string;
  createdAt: string;
  settledAt?: string;
};

const COLLECTION = "lots";

const createLotSchema = z.object({
  mode: z.enum(["netting", "instant"]),
  instructionId: z.string().optional(),
});

const approvalSchema = z.object({ participant: addressSchema, signature: hexSchema });

export function listLots(store: Store): StoredLot[] {
  return store.read<StoredLot>(COLLECTION);
}

export function toLot(stored: StoredLot): Lot {
  return {
    id: BigInt(stored.id),
    cycleId: stored.cycleId,
    fund: stored.fund,
    navPerUnit: BigInt(stored.navPerUnit),
    positions: stored.positions.map((p) => ({ participant: p.participant, shares: BigInt(p.shares), cash: BigInt(p.cash) })),
    instructionIds: stored.instructionIds,
  };
}

function fromPositions(positions: NetPosition[]): StoredPosition[] {
  return positions.map((p) => ({ participant: p.participant, shares: p.shares.toString(), cash: p.cash.toString() }));
}

function abs(value: bigint): bigint {
  return value < 0n ? -value : value;
}

// Gross: what the orders move one by one. Net: what the lot moves. Both in cash and shares.
export function grossAndNet(lot: StoredLot, instructions: StoredInstruction[]) {
  const navPerUnit = BigInt(lot.navPerUnit);
  const inLot = instructions.filter((i) => lot.instructionIds.includes(i.id));
  const grossShares = inLot.reduce((sum, i) => sum + BigInt(i.shares), 0n);
  const grossCash = inLot.reduce((sum, i) => sum + (BigInt(i.shares) * navPerUnit) / 10n ** 6n, 0n);
  const fundLine = lot.positions.find((p) => p.participant.toLowerCase() === lot.fund.toLowerCase());
  return {
    gross: { shares: grossShares.toString(), cash: grossCash.toString() },
    net: { shares: abs(BigInt(fundLine?.shares ?? "0")).toString(), cash: abs(BigInt(fundLine?.cash ?? "0")).toString() },
  };
}

// Delay measured for S-042: from the first signed order of the lot to the settlement,
// and from the lot creation (approvals on the Flex) to the settlement. Seconds.
function delays(lot: StoredLot, instructions: StoredInstruction[]) {
  if (!lot.settledAt) return null;
  const inLot = instructions.filter((i) => lot.instructionIds.includes(i.id));
  const firstOrder = Math.min(...inLot.map((i) => Date.parse(i.receivedAt)));
  const settled = Date.parse(lot.settledAt);
  const seconds = (from: number) => Math.round((settled - from) / 1000);
  return { fromFirstOrder: seconds(firstOrder), fromLotCreation: seconds(Date.parse(lot.createdAt)) };
}

export function lotView(store: Store, lot: StoredLot, config?: ServerConfig) {
  const engineLot = toLot(lot);
  const names = Object.fromEntries([
    ...(config?.participants ?? []).map((p) => [p.address.toLowerCase(), p.name]),
    [lot.fund.toLowerCase(), lot.fundName],
  ]);
  const texts = Object.fromEntries(
    lot.approvers.map((participant) => [participant, lotApprovalToText(engineLot, participant, { fundName: lot.fundName, lotHash: lot.lotHash })]),
  );
  const approvedBy = lot.approvals.map((a) => a.participant);
  const missing = lot.approvers.filter((p) => !approvedBy.some((a) => a.toLowerCase() === p.toLowerCase()));
  const instructions = listInstructions(store);
  return { ...lot, texts, names, missing, ...grossAndNet(lot, instructions), delays: delays(lot, instructions) };
}

function saveLot(store: Store, lot: StoredLot) {
  store.write(COLLECTION, listLots(store).map((stored) => (stored.id === lot.id ? lot : stored)));
}

function markInstructions(store: Store, ids: string[], patch: Partial<StoredInstruction>) {
  writeInstructions(store, listInstructions(store).map((i) => (ids.includes(i.id) ? { ...i, ...patch } : i)));
}

export function registerLotRoutes(app: FastifyInstance, store: Store, config: ServerConfig, chain: Chain | null) {
  app.get("/lots", async () => listLots(store).map((lot) => lotView(store, lot, config)));

  app.get("/lots/:id", async (request, reply) => {
    const lot = listLots(store).find((l) => l.id === (request.params as { id: string }).id);
    if (!lot) return reply.code(404).send({ error: "unknown lot" });
    return lotView(store, lot, config);
  });

  // Build a lot from the signed orders of a cycle. Instant mode takes one order.
  app.post("/cycles/:cycleId/lots", async (request, reply) => {
    const parsed = createLotSchema.safeParse(request.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: "invalid body", issues: parsed.error.issues });
    const { cycleId } = request.params as { cycleId: string };
    const { mode, instructionId } = parsed.data;

    const candidates = listInstructions(store).filter((i) => i.cycleId === cycleId && i.status === "signed" && !i.lotId);
    const selected = mode === "instant" ? candidates.filter((i) => i.id === (instructionId ?? candidates.at(-1)?.id)) : candidates;
    if (selected.length === 0) return reply.code(409).send({ error: "no signed order available for this lot" });
    if (mode === "instant" && selected.length !== 1) return reply.code(409).send({ error: "instant mode settles exactly one order" });

    const fund = config.funds[0]!;
    const instructions = selected.map((i) => ({ ...i, shares: BigInt(i.shares) }));
    const positions = netPositions(instructions, config.navPerUnit, fund.address);
    const id = BigInt(listLots(store).length + 1);
    const lot: Lot = { id, cycleId, fund: fund.address, navPerUnit: config.navPerUnit, positions, instructionIds: selected.map((i) => i.id) };

    if (chain) {
      const short = checkCoverage(lot, await chain.balances(positions.map((p) => p.participant)));
      if (short.length > 0) return reply.code(409).send({ error: "coverage insufficient", participants: short });
    }

    const stored: StoredLot = {
      id: id.toString(),
      cycleId,
      mode,
      fund: fund.address,
      fundName: fund.name,
      navPerUnit: config.navPerUnit.toString(),
      navHash: navHash(config.navInputs),
      positions: fromPositions(positions),
      instructionIds: lot.instructionIds,
      lotHash: chain ? lotHash(lot, chain.shareToken, chain.cashToken) : lotHash(lot, fund.address, fund.address),
      approvers: positions.map((p) => p.participant).filter((p) => p.toLowerCase() !== fund.address.toLowerCase()),
      approvals: [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    store.append(COLLECTION, stored);
    markInstructions(store, stored.instructionIds, { status: "in_lot", lotId: stored.id });
    return reply.code(201).send(lotView(store, stored, config));
  });

  // One EIP-191 approval per participant. The last valid one triggers the settlement.
  app.post("/lots/:id/approvals", async (request, reply) => {
    const lot = listLots(store).find((l) => l.id === (request.params as { id: string }).id);
    if (!lot) return reply.code(404).send({ error: "unknown lot" });
    if (lot.status === "settled") return reply.code(409).send({ error: "lot already settled" });
    const parsed = approvalSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid body", issues: parsed.error.issues });
    const { participant, signature } = parsed.data;

    if (!lot.approvers.some((a) => a.toLowerCase() === participant.toLowerCase())) {
      return reply.code(403).send({ error: "this participant has nothing to approve in this lot" });
    }
    const text = lotApprovalToText(toLot(lot), participant, { fundName: lot.fundName, lotHash: lot.lotHash });
    if (!(await verifyEip191(participant, text, signature))) {
      return reply.code(401).send({ error: "signature does not match the approval text" });
    }
    lot.approvals = [
      ...lot.approvals.filter((a) => a.participant.toLowerCase() !== participant.toLowerCase()),
      { participant, signature, text, receivedAt: new Date().toISOString() },
    ];
    const complete = lot.approvers.every((a) => lot.approvals.some((x) => x.participant.toLowerCase() === a.toLowerCase()));
    lot.status = complete ? "approved" : "pending";
    saveLot(store, lot);
    if (complete) await settle(lot);
    return reply.code(201).send(lotView(store, lot, config));
  });

  // Retry a settlement that failed on chain. Approvals are checked again first.
  app.post("/lots/:id/settle", async (request, reply) => {
    const lot = listLots(store).find((l) => l.id === (request.params as { id: string }).id);
    if (!lot) return reply.code(404).send({ error: "unknown lot" });
    if (lot.status === "settled") return reply.code(409).send({ error: "lot already settled" });
    const missing = lotView(store, lot, config).missing;
    if (missing.length > 0) return reply.code(409).send({ error: "approvals missing", participants: missing });
    await settle(lot);
    return lotView(store, lot, config);
  });

  // Every approval is re-verified right before the transaction. Nothing is sent otherwise.
  async function settle(lot: StoredLot) {
    const engineLot = toLot(lot);
    for (const approver of lot.approvers) {
      const approval = lot.approvals.find((a) => a.participant.toLowerCase() === approver.toLowerCase());
      const text = lotApprovalToText(engineLot, approver, { fundName: lot.fundName, lotHash: lot.lotHash });
      if (!approval || !(await verifyEip191(approver, text, approval.signature))) {
        lot.status = "failed";
        lot.error = `approval of ${approver} missing or invalid`;
        saveLot(store, lot);
        return;
      }
    }
    if (!chain) {
      lot.status = "failed";
      lot.error = "no chain configured (ESCROW_ADDRESS, AGENT_PRIVATE_KEY)";
      saveLot(store, lot);
      return;
    }
    try {
      const txHash = await chain.settle(engineLot, lot.navHash, lot.approvals.map((a) => a.signature));
      lot.status = "settled";
      lot.txHash = txHash;
      lot.explorerUrl = chain.explorerTxUrl(txHash);
      lot.settledAt = new Date().toISOString();
      lot.error = undefined;
      markInstructions(store, lot.instructionIds, { status: "settled" });
    } catch (error) {
      lot.status = "failed";
      lot.error = error instanceof Error ? error.message : String(error);
    }
    saveLot(store, lot);
  }
}
