import { useState } from "react";
import type { Address } from "viem";
import { PARTICIPANTS, type ParticipantKey } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { readAddress } from "../ledger/sign.ts";

export type Addresses = Partial<Record<ParticipantKey, Address>>;

// S-007: read the three derived addresses, each confirmed on the Flex screen.
export function Accounts({ addresses, onAddresses }: { addresses: Addresses; onAddresses: (a: Addresses) => void }) {
  const { signer } = useDmk();
  const [status, setStatus] = useState("");

  async function readAll() {
    if (!signer) return;
    const next: Addresses = {};
    for (const p of PARTICIPANTS) {
      try {
        setStatus(`${p.name}: check the address on the Flex...`);
        next[p.key] = await readAddress(signer, p.path);
        onAddresses({ ...next });
      } catch (e) {
        setStatus(`${p.name}: ${describeDeviceError(e)}`);
        return;
      }
    }
    setStatus("Three addresses read. Copy them into .env (PARTICIPANT_A_ADDRESS, B, C).");
  }

  return (
    <section>
      <h2>2. Three accounts on one Flex</h2>
      <button onClick={readAll} disabled={!signer}>
        Read the three addresses
      </button>
      <table>
        <tbody>
          {PARTICIPANTS.map((p) => (
            <tr key={p.key}>
              <td>{p.name}</td>
              <td>
                <code>{p.path}</code>
              </td>
              <td>
                <code>{addresses[p.key] ?? "..."}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {status && <p>{status}</p>}
    </section>
  );
}
