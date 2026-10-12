import type { ServerConfig } from "../api.ts";
import { useDmk } from "../ledger/dmk.tsx";
import { Badge } from "./Badge.tsx";

const NETWORKS: Record<number, string> = { 84532: "Base Sepolia", 31337: "Local anvil" };

const KEY_SOURCE = {
  "key-ring": { tone: "ok" as const, label: "Agent key: Ledger Key Ring" },
  env: { tone: "warn" as const, label: "Agent key: plain .env (fallback)" },
  none: { tone: "bad" as const, label: "Agent key: none" },
};

export function Header({ config }: { config: ServerConfig | null }) {
  const { signer, connecting } = useDmk();
  const network = config ? (NETWORKS[config.chainId] ?? `Chain ${config.chainId}`) : "Server offline";
  return (
    <header className="header">
      <div>
        <h1>Clearing House</h1>
        <p className="tagline">DvP settlement of fund units, instant or netted. The agent drafts, the code checks, the manager signs on a Ledger Flex.</p>
      </div>
      <div className="status">
        <Badge tone={config ? "accent" : "bad"}>{network}</Badge>
        <Badge tone={signer ? "ok" : "muted"}>{signer ? "Flex connected" : connecting ? "Flex: connecting" : "Flex: not connected"}</Badge>
        {config && <Badge tone={KEY_SOURCE[config.agentKeySource].tone}>{KEY_SOURCE[config.agentKeySource].label}</Badge>}
      </div>
    </header>
  );
}
