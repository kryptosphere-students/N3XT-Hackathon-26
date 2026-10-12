import { createPublicClient, createWalletClient, defineChain, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil, baseSepolia } from "viem/chains";
import type { Lot } from "@chw3/engine";
import type { Balances } from "./engine-adapter.ts";

// The only place that sends a transaction. The agent key signs settle(lot)
// once the engine has checked every participant approval (D6).

export type ChainConfig = {
  rpcUrl: string;
  chainId: number;
  escrow: Address;
  shareToken: Address;
  cashToken: Address;
  agentPrivateKey: Hex;
};

export type Chain = {
  shareToken: Address;
  cashToken: Address;
  settle(lot: Lot, navHash: Hex, signatures: Hex[]): Promise<Hex>;
  balances(participants: Address[]): Promise<Balances>;
  isSettled(lotId: bigint): Promise<boolean>;
  explorerTxUrl(txHash: Hex): string | null;
};

export const escrowAbi = [
  {
    type: "function",
    name: "settle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "lotId", type: "uint256" },
      { name: "navPerUnit", type: "uint256" },
      {
        name: "positions",
        type: "tuple[]",
        components: [
          { name: "participant", type: "address" },
          { name: "shares", type: "int256" },
          { name: "cash", type: "int256" },
        ],
      },
      { name: "navHash", type: "bytes32" },
      { name: "signatures", type: "bytes[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "balances",
    stateMutability: "view",
    inputs: [
      { name: "participant", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "settled",
    stateMutability: "view",
    inputs: [{ name: "lotId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
] as const;

const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org/tx/";

export function chainFromEnv(env: NodeJS.ProcessEnv): ChainConfig | null {
  const { RPC_URL, CHAIN_ID, ESCROW_ADDRESS, SHARE_TOKEN_ADDRESS, CASH_TOKEN_ADDRESS, AGENT_PRIVATE_KEY } = env;
  if (!RPC_URL || !CHAIN_ID || !ESCROW_ADDRESS || !SHARE_TOKEN_ADDRESS || !CASH_TOKEN_ADDRESS || !AGENT_PRIVATE_KEY) return null;
  return {
    rpcUrl: RPC_URL,
    chainId: Number(CHAIN_ID),
    escrow: ESCROW_ADDRESS as Address,
    shareToken: SHARE_TOKEN_ADDRESS as Address,
    cashToken: CASH_TOKEN_ADDRESS as Address,
    agentPrivateKey: AGENT_PRIVATE_KEY as Hex,
  };
}

function viemChain(config: ChainConfig) {
  if (config.chainId === baseSepolia.id) return baseSepolia;
  if (config.chainId === anvil.id) return anvil;
  return defineChain({ id: config.chainId, name: `chain-${config.chainId}`, nativeCurrency: anvil.nativeCurrency, rpcUrls: { default: { http: [config.rpcUrl] } } });
}

export function createChain(config: ChainConfig): Chain {
  const chain = viemChain(config);
  const transport = http(config.rpcUrl);
  const publicClient = createPublicClient({ chain, transport });
  const account = privateKeyToAccount(config.agentPrivateKey);
  const walletClient = createWalletClient({ chain, transport, account });

  return {
    shareToken: config.shareToken,
    cashToken: config.cashToken,

    async settle(lot, navHash, signatures) {
      const hash = await walletClient.writeContract({
        address: config.escrow,
        abi: escrowAbi,
        functionName: "settle",
        args: [lot.id, lot.navPerUnit, lot.positions, navHash, signatures],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error(`settle reverted, tx ${hash}`);
      return hash;
    },

    async balances(participants) {
      const result: Balances = {};
      for (const participant of participants) {
        const [shares, cash] = await Promise.all([
          publicClient.readContract({ address: config.escrow, abi: escrowAbi, functionName: "balances", args: [participant, config.shareToken] }),
          publicClient.readContract({ address: config.escrow, abi: escrowAbi, functionName: "balances", args: [participant, config.cashToken] }),
        ]);
        result[participant] = { shares, cash };
      }
      return result;
    },

    isSettled(lotId) {
      return publicClient.readContract({ address: config.escrow, abi: escrowAbi, functionName: "settled", args: [lotId] });
    },

    explorerTxUrl(txHash) {
      return config.chainId === baseSepolia.id ? BASE_SEPOLIA_EXPLORER + txHash : null;
    },
  };
}
