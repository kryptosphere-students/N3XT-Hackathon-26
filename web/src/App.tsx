import { useRef, useState } from "react";
import {
  ConsoleLogger,
  DeviceManagementKitBuilder,
  DeviceActionStatus,
} from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";

const dmk = new DeviceManagementKitBuilder()
  .addLogger(new ConsoleLogger())
  .addTransport(webHidTransportFactory)
  .build();

const PATH = "44'/60'/0'/0/0";
type Signer = ReturnType<SignerEthBuilder["build"]>;
type State = { status: DeviceActionStatus; output?: unknown; error?: unknown };

// Plain text the user should be able to read on the Flex
const rulesText =
  "Kryptosphere test\nMax per settlement: 50000 USDC\nAllowed fund: Fund F\nVersion 1";

// Fake settlement instruction, no descriptor registered for it
const typedData = {
  domain: {
    name: "Clearing House",
    version: "1",
    chainId: 84532,
    verifyingContract: "0x0000000000000000000000000000000000000001",
  },
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Instruction: [
      { name: "fund", type: "string" },
      { name: "side", type: "string" },
      { name: "shares", type: "uint256" },
      { name: "cash", type: "uint256" },
      { name: "cycle", type: "uint256" },
    ],
  },
  primaryType: "Instruction",
  message: { fund: "Fund F", side: "BUY", shares: "100", cash: "10500000000", cycle: "1" },
};

export default function App() {
  const [log, setLog] = useState("Click to connect your Flex");
  const signer = useRef<Signer | null>(null);

  const show = (label: string) => (state: State) => {
    if (state.status === DeviceActionStatus.Pending) setLog(label + ": check the Flex screen...");
    if (state.status === DeviceActionStatus.Completed) setLog(label + ": " + JSON.stringify(state.output));
    if (state.status === DeviceActionStatus.Error) setLog(label + " error: " + JSON.stringify(state.error));
  };

  function connect() {
    setLog("Looking for the device...");
    const sub = dmk.startDiscovering({}).subscribe({
      next: async (device) => {
        sub.unsubscribe();
        const sessionId = await dmk.connect({ device });
        signer.current = new SignerEthBuilder({ dmk, sessionId, originToken: "test" }).build();
        signer.current.getAddress(PATH, { checkOnDevice: false }).observable.subscribe(show("Address"));
      },
      error: (e) => setLog("Discovery error: " + String(e)),
    });
  }

  function signText() {
    signer.current?.signMessage(PATH, rulesText).observable.subscribe(show("EIP-191"));
  }

  function signTyped() {
    signer.current?.signTypedData(PATH, typedData).observable.subscribe(show("EIP-712"));
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>Flex test</h1>
      <button onClick={connect}>1. Connect</button>{" "}
      <button onClick={signText}>2. Sign text (EIP-191)</button>{" "}
      <button onClick={signTyped}>3. Sign typed data (EIP-712)</button>
      <p style={{ wordBreak: "break-all" }}>{log}</p>
    </main>
  );
}