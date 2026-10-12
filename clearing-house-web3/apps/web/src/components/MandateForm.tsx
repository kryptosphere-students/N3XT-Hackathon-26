import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { CASH_DECIMALS, type Side } from "@chw3/engine";
import { mandateToText, type Mandate } from "@chw3/protocol";
import { getNonces, postMandate } from "../api.ts";
import { PARTICIPANTS, participant, type ParticipantKey } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { signText } from "../ledger/sign.ts";
import type { Addresses } from "./Accounts.tsx";
import { FlexPreview } from "./FlexPreview.tsx";

const DEFAULT_FUND = "Fund F";
const DEFAULT_MAX_CASH = "5000000";

function safeParse(value: string): bigint {
  try {
    return parseUnits(value || "0", CASH_DECIMALS);
  } catch {
    return 0n;
  }
}

// S-019: the manager signs the mandate text on the Flex, the server verifies and stores it.
export function MandateForm({ addresses, onSigned }: { addresses: Addresses; onSigned: () => void }) {
  const { signer } = useDmk();
  const [who, setWho] = useState<ParticipantKey>("A");
  const [funds, setFunds] = useState(DEFAULT_FUND);
  const [maxCash, setMaxCash] = useState(DEFAULT_MAX_CASH);
  const [sides, setSides] = useState<Side[]>(["BUY", "SELL"]);
  const [nonce, setNonce] = useState(1);
  const [status, setStatus] = useState("");

  const address = addresses[who];

  useEffect(() => {
    if (!address) return;
    getNonces(address).then((n) => setNonce(n.mandate)).catch(() => setNonce(1));
  }, [address]);

  function toggleSide(side: Side) {
    setSides((current) => (current.includes(side) ? current.filter((s) => s !== side) : [...current, side]));
  }

  const p = participant(who);
  const mandate: Mandate = {
    participant: address ?? "0x0000000000000000000000000000000000000000",
    participantName: p.name,
    allowedFunds: funds.split(",").map((f) => f.trim()).filter(Boolean),
    maxCashPerCycle: safeParse(maxCash),
    allowedSides: sides,
    nonce,
  };
  const text = mandateToText(mandate);

  async function signAndSend() {
    if (!signer || !address) return;
    try {
      setStatus("Read the text on the Flex and approve it.");
      const signature = await signText(signer, p.path, text);
      await postMandate(mandate, signature);
      setStatus(`Mandate of ${p.name} signed and accepted by the server (nonce ${nonce}).`);
      setNonce((n) => n + 1);
      onSigned();
    } catch (e) {
      setStatus(describeDeviceError(e));
    }
  }

  return (
    <div>
      <div className="form">
        <label>
          Manager
          <select value={who} onChange={(e) => setWho(e.target.value as ParticipantKey)}>
            {PARTICIPANTS.map((x) => (
              <option key={x.key} value={x.key}>
                {x.name}
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
        <div>
          <label className="check">
            <input type="checkbox" checked={sides.includes("BUY")} onChange={() => toggleSide("BUY")} /> subscribe
          </label>
          <label className="check">
            <input type="checkbox" checked={sides.includes("SELL")} onChange={() => toggleSide("SELL")} /> redeem
          </label>
        </div>
      </div>
      <FlexPreview text={text} />
      <div className="actions">
        <button onClick={signAndSend} disabled={!signer || !address || sides.length === 0}>
          Sign the mandate on the Flex
        </button>
      </div>
      {!address && <p className="muted small">Connect the Flex and read the addresses first.</p>}
      {status && <p className="notice info">{status}</p>}
    </div>
  );
}
