import { useEffect, useState } from "react";
import { createLot, getLots, type LotView as Lot } from "../api.ts";
import type { Addresses } from "./Accounts.tsx";
import { LotView } from "./LotView.tsx";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// S-042: the same engine, two buttons. Netting takes every signed order of the
// cycle, instant takes the last signed order alone.
export function Settlement({ addresses }: { addresses: Addresses }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [error, setError] = useState("");

  async function refresh() {
    setLots(await getLots().catch(() => []));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function build(mode: "netting" | "instant") {
    setError("");
    try {
      await createLot(today(), mode);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function replace(updated: Lot) {
    setLots((current) => current.map((l) => (l.id === updated.id ? updated : l)));
  }

  return (
    <section>
      <h2>5. Settlement</h2>
      <button onClick={() => build("netting")}>Settle cycle (netting)</button>{" "}
      <button onClick={() => build("instant")}>Instant settle (last order)</button>
      {error && <p className="error">{error}</p>}
      {lots.length === 0 && <p className="hint">No lot yet. Sign orders first, then build a lot.</p>}
      {[...lots].reverse().map((lot) => (
        <LotView key={lot.id} lot={lot} addresses={addresses} onChange={replace} />
      ))}
    </section>
  );
}
