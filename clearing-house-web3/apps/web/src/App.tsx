import { useState } from "react";
import "./App.css";
import { DmkProvider } from "./ledger/dmk.tsx";
import { ConnectLedger } from "./components/ConnectLedger.tsx";
import { Accounts, type Addresses } from "./components/Accounts.tsx";
import { MandateForm } from "./components/MandateForm.tsx";
import { InstructionForm } from "./components/InstructionForm.tsx";

export default function App() {
  const [addresses, setAddresses] = useState<Addresses>({});
  return (
    <DmkProvider>
      <main>
        <h1>Clearing house</h1>
        <p className="hint">Every signature is readable text on the Flex (EIP-191). Nothing is signed blind.</p>
        <ConnectLedger />
        <Accounts addresses={addresses} onAddresses={setAddresses} />
        <MandateForm addresses={addresses} />
        <InstructionForm addresses={addresses} />
      </main>
    </DmkProvider>
  );
}
