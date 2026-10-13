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
    setStatus("Three addresses read and confirmed on the device.");
  }

  const done = PARTICIPANTS.filter((p) => addresses[p.key]).length;

  return (
    <div>
      <div className="actions">
        <button className="secondary" onClick={readAll} disabled={!signer}>
          Read the three addresses ({done}/3)
        </button>
      </div>
      {status && <p className="muted small">{status}</p>}
    </div>
  );
}
