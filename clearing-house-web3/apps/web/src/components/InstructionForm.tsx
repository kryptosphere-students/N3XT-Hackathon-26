import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { SHARE_DECIMALS, type Side } from "@chw3/engine";
import { instructionToText, type InstructionPayload } from "@chw3/protocol";
import { getNonces, postInstruction, type ServerConfig } from "../api.ts";
import { PARTICIPANTS, participant, type ParticipantKey } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { signText } from "../ledger/sign.ts";
import type { Addresses } from "./Accounts.tsx";
import { FlexPreview } from "./FlexPreview.tsx";
import type { DraftForForm } from "./IntakePanel.tsx";

const ORDER_ID_BYTES = 3;

function newOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ORDER_ID_BYTES));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeParse(value: string): bigint {
  try {
    return parseUnits(value || "0", SHARE_DECIMALS);
  } catch {
    return 0n;
  }
}

type Props = { config: ServerConfig | null; addresses: Addresses; draft: DraftForForm | null; onSigned: () => void };

// S-020: the manager reads the order on the Flex and signs it. The server
// verifies the signature, then the mandate (S-026). A draft from the agent
// only prefills the fields: the Flex shows the final text.
export function InstructionForm({ config, addresses, draft, onSigned }: Props) {
  const { signer } = useDmk();
  const [who, setWho] = useState<ParticipantKey>("A");
  const [side, setSide] = useState<Side>("BUY");
  const [units, setUnits] = useState("100");
  const [cycleId, setCycleId] = useState(today);
  const [orderId, setOrderId] = useState(newOrderId);
  const [nonce, setNonce] = useState(1);
  const [origin, setOrigin] = useState<"agent" | "manual">("manual");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!draft) return;
    setWho(draft.who);
    setSide(draft.side);
    setUnits(draft.units);
    setOrigin("agent");
    setStatus("Prefilled from the agent's draft. Check the fields, then sign on the Flex.");
  }, [draft]);

  const address = addresses[who];
  const fund = config?.funds[0];

  useEffect(() => {
    if (!address) return;
    getNonces(address).then((n) => setNonce(n.instruction)).catch(() => setNonce(1));
  }, [address]);

  const p = participant(who);
  const payload: InstructionPayload = {
    instruction: {
      id: orderId,
      cycleId,
      fund: fund?.address ?? "0x0000000000000000000000000000000000000000",
      participant: address ?? "0x0000000000000000000000000000000000000000",
      side,
      shares: safeParse(units),
    },
    fundName: fund?.name ?? "Fund",
    participantName: p.name,
    nonce,
  };
  const text = instructionToText(payload);

  async function signAndSend() {
    if (!signer || !address || !fund) return;
    try {
      setStatus("Read the order on the Flex and approve it.");
      const signature = await signText(signer, p.path, text);
      const stored = await postInstruction(payload, signature, origin);
      setStatus(
        stored.status === "signed"
          ? `Order ${stored.id} signed and accepted (nonce ${nonce}).`
          : `Order ${stored.id} signed but refused by the mandate: ${stored.reasons.join("; ")}`,
      );
      setOrderId(newOrderId());
      setNonce((n) => n + 1);
      setOrigin("manual");
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
          Fund
          <input value={fund?.name ?? "..."} readOnly />
        </label>
        <label>
          Side
          <select value={side} onChange={(e) => setSide(e.target.value as Side)}>
            <option value="BUY">Subscribe</option>
            <option value="SELL">Redeem</option>
          </select>
        </label>
        <label>
          Units
          <input value={units} onChange={(e) => setUnits(e.target.value)} inputMode="decimal" />
        </label>
        <label>
          Cycle
          <input value={cycleId} onChange={(e) => setCycleId(e.target.value)} />
        </label>
        <label>
          Source
          <input value={origin === "agent" ? "Agent draft from an email" : "Typed by hand"} readOnly />
        </label>
      </div>
      <FlexPreview text={text} />
      <div className="actions">
        <button onClick={signAndSend} disabled={!signer || !address || !fund}>
          Sign the order on the Flex
        </button>
      </div>
      {!address && <p className="muted small">Connect the Flex and read the addresses first.</p>}
      {status && <p className="notice info">{status}</p>}
    </div>
  );
}
