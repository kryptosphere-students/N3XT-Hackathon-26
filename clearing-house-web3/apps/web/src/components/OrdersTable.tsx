import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { SHARE_DECIMALS } from "@chw3/engine";
import { getInstructions, type StoredInstruction } from "../api.ts";

const STATUS_LABEL: Record<StoredInstruction["status"], string> = {
  signed: "signed on the Flex, waiting for a lot",
  rejected: "refused by the mandate",
  in_lot: "in a lot, waiting for approvals",
  settled: "settled on chain",
};

// S-031: every order with its status and, when refused, the reason.
export function OrdersTable({ version }: { version: number }) {
  const [orders, setOrders] = useState<StoredInstruction[]>([]);

  useEffect(() => {
    getInstructions().then(setOrders).catch(() => setOrders([]));
  }, [version]);

  if (orders.length === 0) return <p className="hint">No order yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Cycle</th>
          <th>Manager</th>
          <th>Side</th>
          <th>Units</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {[...orders].reverse().map((o) => (
          <tr key={o.id} className={o.status}>
            <td>
              <code>{o.id}</code>
            </td>
            <td>{o.cycleId}</td>
            <td>{o.participantName}</td>
            <td>{o.side === "BUY" ? "subscribe" : "redeem"}</td>
            <td>{formatUnits(BigInt(o.shares), SHARE_DECIMALS)}</td>
            <td>
              {STATUS_LABEL[o.status]}
              {o.lotId && ` (lot ${o.lotId})`}
              {o.reasons.length > 0 && <div className="error">{o.reasons.join("; ")}</div>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
