import { useEffect, useState } from "react";
import { createLot, getLots, type LotView as Lot } from "../api.ts";
import type { Addresses } from "./Accounts.tsx";
import { LotView } from "./LotView.tsx";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = { addresses: Addresses; version: number; onChange: () => void };

// S-042: the same engine, two buttons. Netting takes every signed order of the
// cycle, instant takes the last signed order alone.
export function Settlement({ addresses, version, onChange }: Props) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getLots().then(setLots).catch(() => setLots([]));
  }, [version]);

  async function build(mode: "netting" | "instant") {
    setError("");
    try {
      await createLot(today(), mode);
      onChange();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div>
      <p>
        <button className="demo" onClick={() => build("netting")}>
          Demo: settle cycle (netting)
        </button>{" "}
        <button className="demo" onClick={() => build("instant")}>
          Demo: instant settle (last order)
        </button>
      </p>
      {error && <p className="error">{error}</p>}
      {lots.length === 0 && <p className="hint">No lot yet. Sign orders first, then build a lot.</p>}
      {[...lots].reverse().map((lot) => (
        <LotView key={lot.id} lot={lot} addresses={addresses} onChange={onChange} />
      ))}
    </div>
  );
}
