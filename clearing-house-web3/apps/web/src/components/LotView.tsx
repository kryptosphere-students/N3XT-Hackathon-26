import { useState } from "react";
import { formatUnits, type Address } from "viem";
import { CASH_DECIMALS, SHARE_DECIMALS } from "@chw3/engine";
import { approveLot, type LotView as Lot } from "../api.ts";
import { PARTICIPANTS } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { signText } from "../ledger/sign.ts";
import type { Addresses } from "./Accounts.tsx";

const units = (value: string) => formatUnits(BigInt(value) < 0n ? -BigInt(value) : BigInt(value), SHARE_DECIMALS);
const cash = (value: string) => formatUnits(BigInt(value) < 0n ? -BigInt(value) : BigInt(value), CASH_DECIMALS);

function nameOf(address: Address, lot: Lot, addresses: Addresses) {
  if (address.toLowerCase() === lot.fund.toLowerCase()) return lot.fundName;
  const p = PARTICIPANTS.find((x) => addresses[x.key]?.toLowerCase() === address.toLowerCase());
  return p?.name ?? address;
}

// S-021, S-032: one lot, gross against net, one Flex signature per participant concerned.
export function LotView({ lot, addresses, onChange }: { lot: Lot; addresses: Addresses; onChange: (lot: Lot) => void }) {
  const { signer } = useDmk();
  const [status, setStatus] = useState("");

  async function approve(participant: Address) {
    const p = PARTICIPANTS.find((x) => addresses[x.key]?.toLowerCase() === participant.toLowerCase());
    if (!signer || !p) return;
    try {
      const text = lot.texts[participant]!;
      setStatus(`${p.name}: read and sign on the Flex:\n${text}`);
      const signature = await signText(signer, p.path, text);
      const updated = await approveLot(lot.id, participant, signature);
      onChange(updated);
      setStatus(updated.status === "settled" ? `Lot ${lot.id} settled.` : `${p.name} approved. Waiting for ${updated.missing.length} more.`);
    } catch (e) {
      setStatus(`${p.name}: ${describeDeviceError(e)}`);
    }
  }

  const approvedBy = lot.approvals.map((a) => a.participant.toLowerCase());

  return (
    <div className="lot">
      <p>
        <strong>Lot {lot.id}</strong> ({lot.mode}), cycle {lot.cycleId}, NAV {cash(lot.navPerUnit)} cash per unit, status <code>{lot.status}</code>
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Units</th>
            <th>Cash</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gross (orders one by one, illustrative)</td>
            <td>{units(lot.gross.shares)}</td>
            <td>{cash(lot.gross.cash)}</td>
          </tr>
          <tr>
            <td>Net (what the lot moves)</td>
            <td>{units(lot.net.shares)}</td>
            <td>{cash(lot.net.cash)}</td>
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Participant</th>
            <th>Units</th>
            <th>Cash</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {lot.positions.map((p) => {
            const needs = lot.approvers.some((a) => a.toLowerCase() === p.participant.toLowerCase());
            const done = approvedBy.includes(p.participant.toLowerCase());
            const canSign = needs && !done && signer && PARTICIPANTS.some((x) => addresses[x.key]?.toLowerCase() === p.participant.toLowerCase());
            return (
              <tr key={p.participant}>
                <td>{nameOf(p.participant, lot, addresses)}</td>
                <td>{BigInt(p.shares) < 0n ? `delivers ${units(p.shares)}` : `receives ${units(p.shares)}`}</td>
                <td>{BigInt(p.cash) < 0n ? `pays ${cash(p.cash)}` : `receives ${cash(p.cash)}`}</td>
                <td>
                  {!needs && "none (fund)"}
                  {needs && done && "signed on the Flex"}
                  {canSign && (
                    <button onClick={() => approve(p.participant)} disabled={lot.status === "settled"}>
                      Sign approval on the Flex
                    </button>
                  )}
                  {needs && !done && !canSign && "waiting (read the addresses in step 2)"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>
        Lot hash <code>{lot.lotHash}</code>
      </p>
      {lot.txHash && (
        <p className="ok">
          Settled, transaction {lot.explorerUrl ? <a href={lot.explorerUrl}>{lot.txHash}</a> : <code>{lot.txHash}</code>}
        </p>
      )}
      {lot.error && <p className="error">{lot.error}</p>}
      {status && <pre>{status}</pre>}
    </div>
  );
}
