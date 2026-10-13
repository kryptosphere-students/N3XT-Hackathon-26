# Cendro · settlement engine for tokenized funds

Ledger N3XT Hackathon 2026 · Team Kryptosphere

Cendro, settlement engine for tokenized funds, settles fund units against cash, with Ledger signatures and an AI intake agent. It is a settlement engine, not a central securities depository. Built by team Kryptosphere for the Ledger N3XT hackathon (OP3N 2026).

## Problem

Subscriptions and redemptions of fund units still run on manual steps. Orders arrive by email, a back office retypes them, a transfer agent centralises them before a cut-off, the administrator publishes the NAV, and cash and units move two or three days later (T+2 or T+3). Three weaknesses come out of this:

- **Authorisation is weak.** The proof that a manager approved an order sits in an email thread or a back-office log, not in a signature anyone can check.
- **Retyping creates errors**, and they are found late, during reconciliation.
- **Tokenized share classes move units on chain in seconds, but the approval around them has not changed.** It is either the manual process above, or a key held by software, where the person who decided is not the one who signs.

An AI agent reading those emails makes the first point worse if nothing bounds it: the agent can be fooled by the email it reads.

What Cendro does not solve: the NAV timetable. Most of the settlement delay comes from cut-offs and NAV publication, which stay with the fund administrator. Cendro shortens what happens around the NAV, not the NAV itself.

## Who it is for

**Buyers: fund depositaries and administrators that run tokenized share classes, and the transfer agents that centralise orders.** They own the subscription and redemption process and can operate a settlement engine for the participants of their funds. CACEIS, for example, provided the infrastructure of Amundi's tokenized money market fund share class in 2025. We have no relationship with them; it shows the segment exists.

**Users:**

- portfolio managers and authorised signatories, each with their own Ledger, who sign mandates, orders and lot approvals;
- back-office teams, who read the agent's drafts and the lots instead of retyping emails;
- auditors, who recompute the lot hash and the NAV hash from the published data.

**Not for:**

- retail investors;
- central securities depositories as a first client: they already settle delivery versus payment at scale and have the longest buying cycles;
- funds whose signatories will not hold a hardware signer.

**Where it fits best:** funds with flows in both directions within a cycle, where netting reduces what moves, and with orders drafted by an agent, where a signed mandate matters. For a fund with one-way flows, netting brings nothing; only instant settlement and the signature trail remain.

## What it does

Three participants hold units of one fund: two managers and a depositary. Their orders arrive by email. The AI agent reads the email and drafts the order. Our code checks the draft against a mandate the manager signed on a Ledger Flex. The manager reads the order on the Flex and signs it. The engine nets the cycle, each participant approves on the Flex what it receives and pays, and the escrow settles units against cash on Base Sepolia, delivery versus payment, in one transaction:

- instant mode: one order, one lot of two lines, settled right away;
- netting mode: all the orders of a cycle, only the net balances move.

Both go through the same `settle(lot)`. The agent never computes an amount and never signs. The trapped email of the demo is refused by the signed mandate, and the Flex is never asked to sign it.

## Screenshots

The dashboard on a local anvil, driven by `npm run screenshots` (three anvil accounts stand in for the Flex, which is why the Flex badge says not connected).

| The agent drafts, the code checks the mandate | The trapped email is refused before any signature |
|---|---|
| ![agent draft](docs-clearing-house-web3/screenshots/03-agent-draft.png) | ![trapped email](docs-clearing-house-web3/screenshots/05-trapped-email.png) |

| Netted lot settled on chain, gross against net | Instant lot of one order |
|---|---|
| ![lot settled](docs-clearing-house-web3/screenshots/07-lot-settled.png) | ![instant](docs-clearing-house-web3/screenshots/08-instant-settled.png) |

## Who signs what

| Action | Done by | Approved by | Proof on the Ledger side |
|---|---|---|---|
| Read the escrow balances | Code | none | none |
| Mandate rules (cap per cycle, allowed funds and sides) | Manager | Manager, on the Flex | EIP-191 signature of the mandate text |
| Draft an order from an email | Agent (`draft_instruction`, the only tool it has) | none, it is a draft | none |
| Check a draft or an order against the mandate | Code (`checkInstruction`) | none, deterministic | none |
| Subscription or redemption order | Manager | Manager, on the Flex | EIP-191 signature of the order text |
| Net the cycle, check coverage, hash the lot | Code | none, deterministic and reproducible | none |
| Approve a lot (what I receive, what I pay) | Each participant | Each participant, on the Flex | EIP-191 signature of the approval text with the lot hash |
| Send `settle(lot)` | Engine key, only once every approval is valid | Checked by code before sending | Signatures published in `LotSettled` |
| Prefund the escrow | Deployer (owner), at deployment | none | none, test tokens |
| Decrypt the agent's LLM key at startup | Code (`wallet-cli ring decrypt`, subprocess) | The developer, who sets `WALLET_PASS` in the terminal | Key derived from the Ledger seed (Key Ring) |

What the agent does alone: read, extract, explain. What a human approves on the device: the mandate, every order, every lot. The agent and the code never see a private key: the Flex holds the participants' keys, the engine key holds test ETH for gas.

## Ledger tools used

- Device Management Kit over WebHID, with the Ethereum signer: [`apps/web/src/ledger/dmk.tsx`](clearing-house-web3/apps/web/src/ledger/dmk.tsx) (provider), [`sign.ts`](clearing-house-web3/apps/web/src/ledger/sign.ts) (`getAddress` with `checkOnDevice`, `signMessage`), [`accounts.ts`](clearing-house-web3/apps/web/src/ledger/accounts.ts) (three derivation paths as constants), [`errors.ts`](clearing-house-web3/apps/web/src/ledger/errors.ts) (user rejection told apart from errors).
- The texts shown on the Flex: [`packages/protocol`](clearing-house-web3/packages/protocol/src). The same code builds the text in the browser and rebuilds it on the server for `verifyMessage`.
- Ledger Key Ring (`wallet-cli ring`): the agent's OpenRouter key is stored encrypted in `secrets/openrouter.enc` and decrypted at startup by [`apps/server/src/agents/secret.ts`](clearing-house-web3/apps/server/src/agents/secret.ts), in a subprocess, with the ring password taken from `WALLET_PASS` in the developer's terminal. The key never sits in clear on disk and never reaches a log. Without the encrypted file the server falls back to `.env` and says so on the page.
- Clear Signing: not available for our own contracts without an ERC-7730 descriptor, so every human signature is EIP-191 text (decision D6, confirmed by the Ledger mentors). Agent Intent is in the roadmap, see `DECISIONS.md` D12.

## Architecture

```
  email ──► POST /intake ──► LLM (OpenRouter) ──► draft ──► checkInstruction (code)
                                                              │ ok
  Ledger Flex ◄── signMessage (EIP-191 text) ◄── web (Vite, React, DMK) ◄──┘
       │ signature
       ▼
  server (Fastify, JSON files)
    verifyMessage ──► mandates, instructions ──► netPositions, lotHash ──► lot
                                                                             │ one approval per participant (Flex)
                                                                             ▼
  SettlementEscrow.settle(lot) ◄── engine key (viem) ◄── all approvals verified
       │
       ▼
  LotSettled(lotId, lotHash, navHash, signatures)  on Base Sepolia
```

Code layout: `clearing-house-web3/contracts` (Foundry), `packages/engine` (netting, pure TypeScript), `packages/protocol` (signed texts), `apps/server` (API, agent, chain client), `apps/web` (dashboard and Flex).

## Run it locally

Needs Node 22, npm, Foundry (`forge`, `anvil`), Chrome and a Ledger Flex with the Ethereum app. Ledger Wallet must be closed.

```bash
cd clearing-house-web3
cp .env.example .env        # fill PARTICIPANT_A/B/C_ADDRESS (step 1 of the page gives them) and OPENROUTER_API_KEY
npm install
npm test                    # Foundry, engine, protocol, server (one test deploys on a local anvil)
npm run demo:local          # anvil + deploy + server + web, then open http://localhost:5173
```

Against Base Sepolia instead: fill the contract addresses below in `.env`, then `npm run dev -w apps/server` and `npm run dev -w apps/web`. The demo, click by click: `docs-clearing-house-web3/demo-script.md`.

## Deployed contracts (Base Sepolia, chain id 84532)

| Contract | Address | Explorer |
|---|---|---|
| ShareToken (Fund F units, 6 decimals, whitelist) | `0x599d84b195A79B3e8E90a4B0dF744057055b6ccc` | [verified source](https://sepolia.basescan.org/address/0x599d84b195A79B3e8E90a4B0dF744057055b6ccc#code) |
| MockCash (test cash, 6 decimals) | `0xdb1D8fb204785C533DB8F3426f8DEf5ba81686b1` | [verified source](https://sepolia.basescan.org/address/0xdb1D8fb204785C533DB8F3426f8DEf5ba81686b1#code) |
| SettlementEscrow (prefunded DvP, `settle(lot)`, `LotSettled`) | `0xeBc2456c49a5E29c69D68258A8865E3f8A694AcE` | [verified source](https://sepolia.basescan.org/address/0xeBc2456c49a5E29c69D68258A8865E3f8A694AcE#code) |

Deployed on 12 Oct by `0xb9d8118635755abCf21DaA6dEd46f964702F8ffC`, which is also the fund's account. The engine role is `0x9970E02eD7D7Ec45749862fd000c093f66649F3A`. Managers A, B and C are three accounts of one Flex (`44'/60'/n'/0/0`), whitelisted and prefunded in the escrow. Lot hash format and reference values: `clearing-house-web3/contracts/README.md`.

## Limits we accept

- The escrow trusts the engine key to have verified the participants' approvals. The signatures are published in `LotSettled`, so anyone can check them afterwards. Verifying them inside the contract is roadmap.
- The escrow is prefunded by the owner at deployment with test tokens. Nobody signs an `approve` on the Flex, because our test tokens have no clear signing descriptor.
- The NAV comes from a mock fund administrator file (`packages/engine/fixtures/nav-fund-f.json`): holdings, liabilities, shares outstanding. The engine computes 105.000000 from it and publishes the hash of inputs and result with the lot. No price oracle.
- One fund, three participants, JSON files as storage. No regulation, no real money.

## Business model

Cendro is sold as software to the depositary or administrator, who operates it for the participants of its funds. Cendro holds no funds and takes no settlement risk.

- **Annual licence per client**, capped by number of funds or participants.
- **Integration fee**: connectors to the transfer agent register, the NAV feed and the client's messaging (for example ISO 20022).
- **Fixed fee per settled instruction.** Not a share of the cash saved by netting: the client bills its own participants, and a share of the savings would put us in conflict with it.
- **Support with an SLA.** Ledger devices are bought by the participants, outside the licence.

**Not validated yet:** order volumes per fund, the real netting rate, the price a client would pay, and the integration cost, which is the main margin risk. Selling to a depositary takes months, with a security audit. Next step: interviews with post-trade operations teams.

**What a pilot would need:** approvals verified inside the escrow (done on a branch, not deployed), ERC-7730 descriptors so approvals can be clear-signed typed data, a real NAV feed instead of the mock file, a network chosen with the client, and an external audit of the contracts.

## Repository

| Path | Content |
|---|---|
| `clearing-house-web3/` | POC code: contracts, engine, protocol, server, web |
| `docs-clearing-house-web3/` | Product docs (French): framing, POC spec, backlog, demo script, developer guide |
| `DISCLOSURE.md` | What existed before the hackathon |
| `DECISIONS.md` | Decision log, D1 to D13 |
| `DX_FEEDBACK.md` | Developer experience log on the Ledger stack |

MIT license, see `LICENSE`.
