import { useDmk } from "../ledger/dmk.tsx";

export function ConnectLedger() {
  const { signer, connecting, error, connect } = useDmk();
  return (
    <section>
      <h2>1. Ledger Flex</h2>
      {signer ? (
        <p className="ok">Connected. Ethereum app open.</p>
      ) : (
        <button onClick={connect} disabled={connecting}>
          {connecting ? "Looking for the device..." : "Connect the Flex (WebHID)"}
        </button>
      )}
      {error && <p className="error">{error}</p>}
      <p className="hint">Close Ledger Wallet first. Chrome only.</p>
    </section>
  );
}
