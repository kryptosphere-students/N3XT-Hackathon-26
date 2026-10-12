import { useState } from "react";
import { parseUnits } from "viem";
import { CASH_DECIMALS, type Side } from "@chw3/engine";
import { mandateToText, type Mandate } from "@chw3/protocol";
import { getNonces, postMandate } from "../api.ts";
import { PARTICIPANTS, participant, type ParticipantKey } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { signText } from "../ledger/sign.ts";
import type { Addresses } from "./Accounts.tsx";

const DEFAULT_FUND = "Fund F";
const DEFAULT_MAX_CASH = "5000000";

// S-019: the manager signs the mandate text on the Flex, the server verifies and stores it.
export function MandateForm({ addresses, onSigned }: { addresses: Addresses; onSigned: () => void }) {
  const { signer } = useDmk();
  const [who, setWho] = useState<ParticipantKey>("A");
  const [funds, setFunds] = useState(DEFAULT_FUND);
  const [maxCash, setMaxCash] = useState(DEFAULT_MAX_CASH);
  const [sides, setSides] = useState<Side[]>(["BUY", "SELL"]);
  const [status, setStatus] = useState("");

  const address = addresses[who];

  function toggleSide(side: Side) {
    setSides((current) => (current.includes(side) ? current.filter((s) => s !== side) : [...current, side]));
  }

  async function signAndSend() {
    if (!signer || !address) return;
    const p = participant(who);
    try {
      const { mandate: nonce } = await getNonces(address);
      const mandate: Mandate = {
        participant: address,
        participantName: p.name,
        allowedFunds: funds.split(",").map((f) => f.trim()).filter(Boolean),
        maxCashPerCycle: parseUnits(maxCash, CASH_DECIMALS),
        allowedSides: sides,
        nonce,
      };
      const text = mandateToText(mandate);
      setStatus("Read and sign on the Flex:\n" + text);
      const signature = await signText(signer, p.path, text);
      await postMandate(mandate, signature);
      setStatus(`Mandate of ${p.name} signed and accepted by the server (nonce ${nonce}).`);
      onSigned();
    } catch (e) {
      setStatus(describeDeviceError(e));
    }
  }

  return (
    <div>
      <label>
        Manager
        <select value={who} onChange={(e) => setWho(e.target.value as ParticipantKey)}>
          {PARTICIPANTS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Allowed funds
        <input value={funds} onChange={(e) => setFunds(e.target.value)} />
      </label>
      <label>
        Max cash per cycle
        <input value={maxCash} onChange={(e) => setMaxCash(e.target.value)} inputMode="decimal" />
      </label>
      <label>
        <input type="checkbox" checked={sides.includes("BUY")} onChange={() => toggleSide("BUY")} /> subscribe
      </label>
      <label>
        <input type="checkbox" checked={sides.includes("SELL")} onChange={() => toggleSide("SELL")} /> redeem
      </label>
      <button onClick={signAndSend} disabled={!signer || !address || sides.length === 0}>
        Sign the mandate on the Flex
      </button>
      {!address && <p className="hint">Connect the Flex and read the addresses first.</p>}
      {status && <pre>{status}</pre>}
    </div>
  );
}
