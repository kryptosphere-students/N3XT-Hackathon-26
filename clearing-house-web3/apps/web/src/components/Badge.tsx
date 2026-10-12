import type { InstructionStatus, LotStatus } from "../api.ts";

type Tone = "ok" | "accent" | "warn" | "bad" | "muted";

export function Badge({ tone = "muted", children }: { tone?: Tone; children: string }) {
  return <span className={`badge ${tone === "muted" ? "" : tone}`}>{children}</span>;
}

const ORDER: Record<InstructionStatus, { tone: Tone; label: string }> = {
  signed: { tone: "accent", label: "Signed on Flex" },
  rejected: { tone: "bad", label: "Refused by mandate" },
  in_lot: { tone: "warn", label: "In lot" },
  settled: { tone: "ok", label: "Settled" },
};

const LOT: Record<LotStatus, { tone: Tone; label: string }> = {
  pending: { tone: "warn", label: "Waiting for approvals" },
  approved: { tone: "accent", label: "Approved, settling" },
  settled: { tone: "ok", label: "Settled on chain" },
  failed: { tone: "bad", label: "Failed" },
};

export function OrderBadge({ status }: { status: InstructionStatus }) {
  return <Badge tone={ORDER[status].tone}>{ORDER[status].label}</Badge>;
}

export function LotBadge({ status }: { status: LotStatus }) {
  return <Badge tone={LOT[status].tone}>{LOT[status].label}</Badge>;
}
