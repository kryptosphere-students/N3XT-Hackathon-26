import { useState } from "react";
import type { Address } from "viem";
import { approveLot, type LotView as Lot } from "../api.ts";
import { cash, shortAddress, shortHash, time, units } from "../format.ts";
import { PARTICIPANTS } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { signText } from "../ledger/sign.ts";
import type { Addresses } from "./Accounts.tsx";
import { Badge, LotBadge } from "./Badge.tsx";
import { FlexPreview } from "./FlexPreview.tsx";
import { Timeline, type Step } from "./Timeline.tsx";

function nameOf(address: Address, lot: Lot, addresses: Addresses) {
  if (address.toLowerCase() === lot.fund.toLowerCase()) return lot.fundName;
  const fromServer = lot.names?.[address.toLowerCase()];
  if (fromServer) return fromServer;
  const p = PARTICIPANTS.find((x) => addresses[x.key]?.toLowerCase() === address.toLowerCase());
  return p?.name ?? shortAddress(address);
}

function stepsOf(lot: Lot, addresses: Addresses): Step[] {
  const steps: Step[] = [{ label: `Lot built (${lot.mode}, ${lot.instructionIds.length} order${lot.instructionIds.length > 1 ? "s" : ""})`, state: "done" }];
  for (const a of lot.approvals) steps.push({ label: `Approved on the Flex by ${nameOf(a.participant, lot, addresses)} at ${time(a.receivedAt)}`, state: "done" });
  for (const m of lot.missing) steps.push({ label: `Approval of ${nameOf(m, lot, addresses)}`, state: "current" });
  steps.push(
    lot.status === "settled"
      ? { label: "Settled on chain by the engine key", state: "done" }
      : lot.status === "failed"
        ? { label: "Settlement failed", state: "bad" }
        : { label: "settle(lot) sent once every approval is valid", state: "todo" },
  );
  return steps;
}

// S-021, S-032, S-042: one lot, gross against net, delays, one Flex signature per participant concerned.
export function LotView({ lot, addresses, onChange }: { lot: Lot; addresses: Addresses; onChange: () => void }) {
  const { signer } = useDmk();
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState<Address | null>(null);

  async function approve(participant: Address) {
    const p = PARTICIPANTS.find((x) => addresses[x.key]?.toLowerCase() === participant.toLowerCase());
    if (!signer || !p) return;
    try {
      setPreview(participant);
      setStatus(`${p.name}: read the approval on the Flex and sign it.`);
      const signature = await signText(signer, p.path, lot.texts[participant]!);
      const updated = await approveLot(lot.id, participant, signature);
      setStatus(updated.status === "settled" ? `Lot ${lot.id} settled.` : `${p.name} approved. Waiting for ${updated.missing.length} more.`);
      setPreview(null);
      onChange();
    } catch (e) {
      setStatus(`${p.name}: ${describeDeviceError(e)}`);
    }
  }

  const approvedBy = lot.approvals.map((a) => a.participant.toLowerCase());
  const savings = BigInt(lot.gross.cash) > 0n ? Number(((BigInt(lot.gross.cash) - BigInt(lot.net.cash)) * 100n) / BigInt(lot.gross.cash)) : 0;

  return (
    <div className="lot" data-testid={`lot-${lot.id}`}>
      <div className="lot-head">
        <h3>
          Lot {lot.id} <span className="muted">({lot.mode === "netting" ? "netting, whole cycle" : "instant, one order"}, cycle {lot.cycleId})</span>
        </h3>
        <LotBadge status={lot.status} />
      </div>
      <Timeline steps={stepsOf(lot, addresses)} />
      <div className="kpis">
        <div className="kpi">
          <div className="k">Gross cash (order by order)</div>
          <div className="v">{cash(lot.gross.cash)}</div>
        </div>
        <div className="kpi accent">
          <div className="k">Net cash (what the lot moves)</div>
          <div className="v">{cash(lot.net.cash)}</div>
        </div>
        <div className="kpi">
          <div className="k">Cash saved by netting</div>
          <div className="v">{lot.mode === "netting" ? `${savings}%` : "n/a"}</div>
        </div>
        <div className="kpi">
          <div className="k">Order to settlement</div>
          <div className="v">{lot.delays ? `${lot.delays.fromFirstOrder}s` : "..."}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Participant</th>
            <th className="num">Units</th>
            <th className="num">Cash</th>
            <th>Approval on the Flex</th>
          </tr>
        </thead>
        <tbody>
          {lot.positions.map((p) => {
            const needs = lot.approvers.some((a) => a.toLowerCase() === p.participant.toLowerCase());
            const done = approvedBy.includes(p.participant.toLowerCase());
            const canSign = needs && !done && signer && PARTICIPANTS.some((x) => addresses[x.key]?.toLowerCase() === p.participant.toLowerCase());
            return (
              <tr key={p.participant}>
                <td>
                  <strong>{nameOf(p.participant, lot, addresses)}</strong>
                </td>
                <td className="num">{BigInt(p.shares) < 0n ? `delivers ${units(p.shares)}` : `receives ${units(p.shares)}`}</td>
                <td className="num">{BigInt(p.cash) < 0n ? `pays ${cash(p.cash)}` : `receives ${cash(p.cash)}`}</td>
                <td>
                  {!needs && <Badge>Fund line, no approval</Badge>}
                  {needs && done && <Badge tone="ok">Signed on Flex</Badge>}
                  {canSign && (
                    <button onClick={() => approve(p.participant)} disabled={lot.status === "settled"}>
                      Sign approval on the Flex
                    </button>
                  )}
                  {needs && !done && !canSign && <Badge tone="warn">Waiting</Badge>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {preview && lot.texts[preview] && <FlexPreview text={lot.texts[preview]!} />}
      <p className="small muted">
        Lot hash <code>{shortHash(lot.lotHash)}</code> <span title={lot.lotHash}>(full hash in the signed text and in the LotSettled event)</span>
        {lot.delays && <>, approvals to settlement {lot.delays.fromLotCreation}s</>}
      </p>
      {lot.txHash && (
        <p className="notice ok">
          Settled. Transaction {lot.explorerUrl ? <a href={lot.explorerUrl}>{shortHash(lot.txHash)} on Basescan</a> : <code>{shortHash(lot.txHash)}</code>}. The
          LotSettled event carries the lot hash, the NAV hash and the {lot.approvals.length} participant signatures.
        </p>
      )}
      {lot.error && <p className="notice bad">{lot.error}</p>}
      {status && <p className="notice info">{status}</p>}
    </div>
  );
}
