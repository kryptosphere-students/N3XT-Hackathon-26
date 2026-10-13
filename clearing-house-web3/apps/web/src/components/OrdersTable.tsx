import { useEffect, useState } from "react";
import { getInstructions, getLots, type LotView, type StoredInstruction } from "../api.ts";
import { sideLabel, shortHash, time, units } from "../format.ts";
import { OrderBadge } from "./Badge.tsx";
import { Timeline, type Step } from "./Timeline.tsx";

// S-031: every order with its status, its reason when refused, and its timeline.
function stepsOf(o: StoredInstruction, lot: LotView | undefined): Step[] {
  const steps: Step[] = [];
  if (o.origin === "agent") steps.push({ label: "Drafted by the agent from an email", state: "done" });
  steps.push(o.status === "rejected" ? { label: `Mandate check: refused`, state: "bad" } : { label: "Mandate check: ok", state: "done" });
  steps.push({ label: `Signed on the Flex by ${o.participantName} at ${time(o.receivedAt)}`, state: "done" });
  if (o.status === "rejected") return steps;
  steps.push(lot ? { label: `Lot ${lot.id} (${lot.mode})`, state: "done" } : { label: "Waiting for a lot", state: "current" });
  if (lot) {
    for (const a of lot.approvals) steps.push({ label: `Approved by ${nameIn(lot, a.participant)} at ${time(a.receivedAt)}`, state: "done" });
    for (const m of lot.missing) steps.push({ label: `Approval of ${nameIn(lot, m)}`, state: "current" });
    steps.push(
      lot.status === "settled"
        ? { label: `Settled, tx ${lot.txHash ? shortHash(lot.txHash) : ""}`, state: "done" }
        : lot.status === "failed"
          ? { label: `Settlement failed`, state: "bad" }
          : { label: "Settlement", state: "todo" },
    );
  }
  return steps;
}

function nameIn(lot: LotView, address: string): string {
  return lot.names?.[address.toLowerCase()] ?? shortHash(address);
}

export function OrdersTable({ version }: { version: number }) {
  const [orders, setOrders] = useState<StoredInstruction[]>([]);
  const [lots, setLots] = useState<LotView[]>([]);

  useEffect(() => {
    getInstructions().then(setOrders).catch(() => setOrders([]));
    getLots().then(setLots).catch(() => setLots([]));
  }, [version]);

  if (orders.length === 0) return <p className="muted">No order yet. Use the agent or the form above.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Cycle</th>
          <th>Manager</th>
          <th>Side</th>
          <th className="num">Units</th>
          <th>Status</th>
          <th>Timeline</th>
        </tr>
      </thead>
      <tbody>
        {[...orders].reverse().map((o) => {
          const lot = lots.find((l) => l.id === o.lotId);
          return (
            <tr key={o.id}>
              <td>
                <code>{o.id}</code>
              </td>
              <td>{o.cycleId}</td>
              <td>{o.participantName}</td>
              <td>{sideLabel(o.side)}</td>
              <td className="num">{units(o.shares)}</td>
              <td>
                <OrderBadge status={o.status} />
                {o.reasons.length > 0 && <div className="small" style={{ color: "var(--bad)", marginTop: 4 }}>{o.reasons.join("; ")}</div>}
                {lot?.explorerUrl && (
                  <div className="small">
                    <a href={lot.explorerUrl}>View on Basescan</a>
                  </div>
                )}
              </td>
              <td className="wrap">
                <Timeline steps={stepsOf(o, lot)} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
