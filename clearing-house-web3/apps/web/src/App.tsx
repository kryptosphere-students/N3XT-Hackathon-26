import { useEffect, useState } from "react";
import "./App.css";
import { getConfig, type ServerConfig } from "./api.ts";
import { DmkProvider } from "./ledger/dmk.tsx";
import { ConnectLedger } from "./components/ConnectLedger.tsx";
import { Accounts, type Addresses } from "./components/Accounts.tsx";
import { MandatesPanel } from "./components/MandatesPanel.tsx";
import { MandateForm } from "./components/MandateForm.tsx";
import { IntakePanel, type DraftForForm } from "./components/IntakePanel.tsx";
import { InstructionForm } from "./components/InstructionForm.tsx";
import { OrdersTable } from "./components/OrdersTable.tsx";
import { Settlement } from "./components/Settlement.tsx";

const BASE_SEPOLIA = 84532;

// One page, left to right: who signs, what arrives, what is signed, what settles.
export default function App() {
  const [addresses, setAddresses] = useState<Addresses>({});
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [draft, setDraft] = useState<DraftForForm | null>(null);
  const [version, setVersion] = useState(0);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    getConfig().then(setConfig).catch((e: Error) => setServerError("Server not reachable: " + e.message));
  }, []);

  const refresh = () => setVersion((v) => v + 1);

  return (
    <DmkProvider>
      <header>
        <h1>Clearing house</h1>
        <p className="hint">
          DvP settlement of fund units, instant or netted. Every human signature is readable text on the Ledger Flex (EIP-191). The agent drafts, the code checks, the manager signs.
          {config && config.chainId === BASE_SEPOLIA && (
            <>
              {" "}
              Escrow on Base Sepolia: <a href={`https://sepolia.basescan.org/address/${config.escrow}`}>{config.escrow}</a>
            </>
          )}
        </p>
        {serverError && <p className="error">{serverError}</p>}
      </header>

      <div className="grid">
        <section>
          <h2>1. Ledger Flex</h2>
          <ConnectLedger />
          <Accounts addresses={addresses} onAddresses={setAddresses} />
        </section>

        <section>
          <h2>2. Participants and mandates</h2>
          <MandatesPanel config={config} addresses={addresses} version={version} />
          <details>
            <summary>Sign a mandate on the Flex</summary>
            <MandateForm addresses={addresses} onSigned={refresh} />
          </details>
        </section>

        <section>
          <h2>3. Order intake agent</h2>
          <IntakePanel onDraft={setDraft} />
        </section>

        <section>
          <h2>4. Order to sign</h2>
          <InstructionForm config={config} addresses={addresses} draft={draft} onSigned={refresh} />
        </section>

        <section className="wide">
          <h2>5. Orders</h2>
          <OrdersTable version={version} />
        </section>

        <section className="wide">
          <h2>6. Settlement, gross against net</h2>
          <Settlement addresses={addresses} version={version} onChange={refresh} />
        </section>
      </div>
    </DmkProvider>
  );
}
