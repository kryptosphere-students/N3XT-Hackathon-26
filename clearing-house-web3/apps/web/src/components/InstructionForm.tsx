import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { SHARE_DECIMALS, type Side } from "@chw3/engine";
import { instructionToText, type InstructionPayload } from "@chw3/protocol";
import { getConfig, getNonces, postInstruction, type ServerConfig } from "../api.ts";
import { PARTICIPANTS, participant, type ParticipantKey } from "../ledger/accounts.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { describeDeviceError } from "../ledger/errors.ts";
import { signText } from "../ledger/sign.ts";
import type { Addresses } from "./Accounts.tsx";

const ORDER_ID_BYTES = 3;

function newOrderId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ORDER_ID_BYTES));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// S-020: the manager reads the order on the Flex and signs it. The server
// verifies the signature; the mandate check (S-026) comes after.
export function InstructionForm({ addresses }: { addresses: Addresses }) {
  const { signer } = useDmk();
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [who, setWho] = useState<ParticipantKey>("A");
  const [side, setSide] = useState<Side>("BUY");
  const [units, setUnits] = useState("100");
  const [cycleId, setCycleId] = useState(today);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getConfig().then(setConfig).catch((e: Error) => setStatus("Server not reachable: " + e.message));
  }, []);

  const address = addresses[who];
  const fund = config?.funds[0];

  async function signAndSend() {
    if (!signer || !address || !fund) return;
    const p = participant(who);
    try {
      const { instruction: nonce } = await getNonces(address);
      const payload: InstructionPayload = {
        instruction: {
          id: newOrderId(),
          cycleId,
          fund: fund.address,
          participant: address,
          side,
          shares: parseUnits(units, SHARE_DECIMALS),
        },
        fundName: fund.name,
        participantName: p.name,
        nonce,
      };
      const text = instructionToText(payload);
      setStatus("Read and sign on the Flex:\n" + text);
      const signature = await signText(signer, p.path, text);
      await postInstruction(payload, signature);
      setStatus(`Order ${payload.instruction.id} signed and accepted by the server (nonce ${nonce}).`);
    } catch (e) {
      setStatus(describeDeviceError(e));
    }
  }

  return (
    <section>
      <h2>4. Order</h2>
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
      <button onClick={signAndSend} disabled={!signer || !address || !fund}>
        Sign the order on the Flex
      </button>
      {status && <pre>{status}</pre>}
    </section>
  );
}
