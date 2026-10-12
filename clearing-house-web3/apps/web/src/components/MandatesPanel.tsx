import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { CASH_DECIMALS } from "@chw3/engine";
import { getMandates, type ServerConfig, type StoredMandate } from "../api.ts";
import { PARTICIPANTS } from "../ledger/accounts.ts";
import type { Addresses } from "./Accounts.tsx";

const short = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

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
          <th>Flex path</th>
          <th>Address (.env)</th>
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
              <td>{p.name}</td>
              <td>
                <code>{p.path}</code>
              </td>
              <td>
                {configured ? <code title={configured}>{short(configured)}</code> : "not in .env"}
                {mismatch && <span className="error"> (Flex gives another address)</span>}
              </td>
              <td>
                {mandate
                  ? `${mandate.allowedFunds.join(", ")}, max ${formatUnits(BigInt(mandate.maxCashPerCycle), CASH_DECIMALS)} cash per cycle, ${mandate.allowedSides.map((s) => (s === "BUY" ? "subscribe" : "redeem")).join(" and ")}, signed (nonce ${mandate.nonce})`
                  : "none signed"}
              </td>
            </tr>
          );
        })}
        {config && (
          <tr>
            <td>{config.funds[0]?.name}</td>
            <td>none (operated by the clearing house)</td>
            <td>
              <code title={config.funds[0]?.address}>{short(config.funds[0]?.address ?? "")}</code>
            </td>
            <td>n/a</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
