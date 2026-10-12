import { useEffect, useState } from "react";
import "./App.css";
import { getConfig, type ServerConfig } from "./api.ts";
import { DmkProvider } from "./ledger/dmk.tsx";
import { Header } from "./components/Header.tsx";
import { ConnectLedger } from "./components/ConnectLedger.tsx";
import { Accounts, type Addresses } from "./components/Accounts.tsx";
import { MandatesPanel } from "./components/MandatesPanel.tsx";
import { MandateForm } from "./components/MandateForm.tsx";
import { IntakePanel, type DraftForForm } from "./components/IntakePanel.tsx";
import { InstructionForm } from "./components/InstructionForm.tsx";
import { OrdersTable } from "./components/OrdersTable.tsx";
import { Settlement } from "./components/Settlement.tsx";

function Card({ step, title, wide, children }: { step: number; title: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={`card${wide ? " wide" : ""}`}>
      <h2>
        <span className="step">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// One page, top to bottom: who signs, what arrives, what is signed, what settles.
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
      <Header config={config} />
      {serverError && <p className="notice bad">{serverError}</p>}
      <div className="grid">
        <Card step={1} title="Ledger Flex">
          <ConnectLedger />
          <Accounts addresses={addresses} onAddresses={setAddresses} />
        </Card>

        <Card step={2} title="Participants and signed mandates">
          <MandatesPanel config={config} addresses={addresses} version={version} />
          <details>
            <summary>Sign a mandate on the Flex</summary>
            <MandateForm addresses={addresses} onSigned={refresh} />
          </details>
        </Card>

        <Card step={3} title="Order intake agent">
          <IntakePanel onDraft={setDraft} />
        </Card>

        <Card step={4} title="Order to sign on the Flex">
          <InstructionForm config={config} addresses={addresses} draft={draft} onSigned={refresh} />
        </Card>

        <Card step={5} title="Orders" wide>
          <OrdersTable version={version} />
        </Card>

        <Card step={6} title="Settlement, gross against net" wide>
          <Settlement addresses={addresses} version={version} onChange={refresh} />
        </Card>
      </div>
    </DmkProvider>
  );
}
