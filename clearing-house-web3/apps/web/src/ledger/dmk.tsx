import { createContext, useContext, useState, type ReactNode } from "react";
import { ConsoleLogger, DeviceManagementKitBuilder, type DeviceManagementKit } from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import { SignerEthBuilder, type SignerEth } from "@ledgerhq/device-signer-kit-ethereum";

// One DMK instance per app, owned by the provider (no module singleton, S-005).
type DmkContextValue = {
  signer: SignerEth | null;
  connecting: boolean;
  error: string | null;
  connect: () => void;
};

const DmkContext = createContext<DmkContextValue | null>(null);

// Without a partner origin token the signer still works: the Flex shows the plain text
// of signMessage, which is all this app needs (D6).
const ORIGIN_TOKEN = import.meta.env.VITE_LEDGER_ORIGIN_TOKEN || "clearing-house-web3";

function buildDmk(): DeviceManagementKit {
  return new DeviceManagementKitBuilder().addLogger(new ConsoleLogger()).addTransport(webHidTransportFactory).build();
}

export function DmkProvider({ children }: { children: ReactNode }) {
  const [dmk] = useState(buildDmk);
  const [signer, setSigner] = useState<SignerEth | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function connect() {
    setConnecting(true);
    setError(null);
    const sub = dmk.startDiscovering({}).subscribe({
      next: async (device) => {
        sub.unsubscribe();
        const sessionId = await dmk.connect({ device });
        setSigner(new SignerEthBuilder({ dmk, sessionId, originToken: ORIGIN_TOKEN }).build());
        setConnecting(false);
      },
      error: (e) => {
        setError("Discovery error: " + String(e));
        setConnecting(false);
      },
    });
  }

  return <DmkContext.Provider value={{ signer, connecting, error, connect }}>{children}</DmkContext.Provider>;
}

export function useDmk(): DmkContextValue {
  const value = useContext(DmkContext);
  if (!value) throw new Error("useDmk needs a DmkProvider");
  return value;
}
