import { useEffect, useState } from "react";
import { getMandates, type ServerConfig, type StoredMandate } from "../api.ts";
import { cash, shortAddress } from "../format.ts";
import { PARTICIPANTS } from "../ledger/accounts.ts";
import type { Addresses } from "./Accounts.tsx";
import { Badge } from "./Badge.tsx";

// Who is who: the three Flex accounts, their address in .env, and the mandate in force.
export function MandatesPanel({ config, addresses, version }: { config: ServerConfig | null; addresses: Addresses; version: number }) {
  const [mandates, setMandates] = useState<StoredMandate[]>([]);

  useEffect(() => {
    getMandates().then(setMandates).catch(() => setMandates([]));
  }, [version]);

  function mandateOf(address: string | undefined) {
    if (!address) return undefined;
    return mandates.filter((m) => m.participant.toLowerCase() === address.toLowerCase()).sort((x, y) => y.nonce - x.nonce)[0];
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Participant</th>
          <th>Flex account</th>
          <th>Address</th>
          <th>Mandate</th>
        </tr>
      </thead>
      <tbody>
        {PARTICIPANTS.map((p) => {
          const configured = config?.participants.find((c) => c.key === p.key)?.address;
          const read = addresses[p.key];
          const mandate = mandateOf(configured ?? read);
          const mismatch = configured && read && configured.toLowerCase() !== read.toLowerCase();
          return (
            <tr key={p.key}>
              <td>
                <strong>{p.name}</strong>
              </td>
              <td>
                <code>{p.path}</code>
              </td>
              <td>
                {configured ? <code title={configured}>{shortAddress(configured)}</code> : <span className="muted">not in .env</span>}
                {mismatch && <div className="small" style={{ color: "var(--bad)" }}>Flex gives another address</div>}
              </td>
              <td className="wrap">
                {mandate ? (
                  <>
                    <Badge tone="ok">Signed on Flex</Badge>{" "}
                    <span className="small muted">
                      {mandate.allowedFunds.join(", ")}, {mandate.allowedSides.map((s) => (s === "BUY" ? "subscribe" : "redeem")).join(" and ")}, cap {cash(mandate.maxCashPerCycle)} cash per cycle, nonce {mandate.nonce}
                    </span>
                  </>
                ) : (
                  <Badge>No mandate</Badge>
                )}
              </td>
            </tr>
          );
        })}
        {config && (
          <tr>
            <td>
              <strong>{config.funds[0]?.name}</strong>
            </td>
            <td className="muted" style={{ whiteSpace: "normal" }}>
              operated by the clearing house
            </td>
            <td>
              <code title={config.funds[0]?.address}>{shortAddress(config.funds[0]?.address ?? "")}</code>
            </td>
            <td className="muted">none needed</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
