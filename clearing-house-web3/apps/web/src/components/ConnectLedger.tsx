import { useDmk } from "../ledger/dmk.tsx";

export function ConnectLedger() {
  const { signer, connecting, error, connect } = useDmk();
  return (
    <div>
      {signer ? (
        <p className="notice ok">Flex connected, Ethereum app open.</p>
      ) : (
        <div className="actions">
          <button onClick={connect} disabled={connecting}>
            {connecting ? "Looking for the device..." : "Connect the Flex (WebHID)"}
          </button>
        </div>
      )}
      {error && <p className="notice bad">{error}</p>}
      <p className="muted small">Chrome only. Close Ledger Wallet first, otherwise the browser cannot see the device.</p>
    </div>
  );
}
