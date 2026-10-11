import { useState } from "react";
import {
  ConsoleLogger,
  DeviceManagementKitBuilder,
  DeviceActionStatus,
} from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";

// The DMK talks to the Ledger over WebHID (Chrome only)
const dmk = new DeviceManagementKitBuilder()
  .addLogger(new ConsoleLogger())
  .addTransport(webHidTransportFactory)
  .build();

export default function App() {
  const [log, setLog] = useState("Click to connect your Flex");

  function connect() {
    setLog("Looking for the device...");
    const sub = dmk.startDiscovering({}).subscribe({
      next: async (device) => {
        sub.unsubscribe();
        const sessionId = await dmk.connect({ device });
        setLog("Connected. Open the Ethereum app on the Flex.");
        const signer = new SignerEthBuilder({ dmk, sessionId, originToken: "test" }).build();
        const { observable } = signer.getAddress("44'/60'/0'/0/0", { checkOnDevice: true });
        observable.subscribe((state) => {
          if (state.status === DeviceActionStatus.Pending) setLog("Check the Flex screen...");
          if (state.status === DeviceActionStatus.Completed) setLog("Address: " + state.output.address);
          if (state.status === DeviceActionStatus.Error) setLog("Error: " + JSON.stringify(state.error));
        });
      },
      error: (e) => setLog("Discovery error: " + String(e)),
    });
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>Flex test</h1>
      <button onClick={connect}>Connect Ledger</button>
      <p>{log}</p>
    </main>
  );
}