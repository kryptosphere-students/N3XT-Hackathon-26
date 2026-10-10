# Decisions

## D1. What the AI does (decided 8 Oct)

We looked at four options: an agent that trades on its own, the full Ouroboros protocol (lending, collar, basis trade) with an agent on top, a non-finance idea, and a copilot.

We picked the copilot. The AI plans, explains and prepares. Our code checks every proposal against rules the user signed. The user approves on the Ledger.

Why:

- The problem is real for Ledger's own users: people who hold BTC, need cash and don't want to sell or trust a lender again.
- It's the model Ledger pushes (the agent proposes, the human approves), and the brief explicitly asks for a clear line between the two.

What we dropped: the collar and the basis trade, now roadmap. We don't talk about taxes. The pitch is about keeping BTC exposure.

Device: Ledger Flex.

## D2. Chain and protocol (proposed 9 Oct, waiting on the mentors)

Base with Morpho Blue and a cbBTC/USDC market. Morpho Blue already has a Clear Signing descriptor on Base, Base Sepolia and Sepolia, so supplyCollateral, borrow and repay show in clear on the Flex.

For the crash case we add a Protection Vault. The user funds it with USDC. The agent can only call `protect()`, which repays the user's Morpho debt when the on-chain LTV goes above the threshold the user signed. Morpho lets anyone repay on behalf of a borrower, so the vault doesn't need any permission on the position.

Downside: Coinbase holds the BTC behind cbBTC. We say so, and tBTC is on the roadmap.

Demo network: Base Sepolia. We control the oracle there, so we can fake a crash live. If test tokens look bad on the Flex, we add a short mainnet clip with about $20.

## D3. Ledger tools and where they go (proposed)

- DMK and the Ethereum signer in the web app: every lending transaction, and the signature of the rules.
- Key Ring (`wallet-cli ring`): encrypts the user's profile and the agent's secrets.
- Agent Intent, if we have time: the agent proposes the USDC transfer to the user's exchange account.
- Wallet CLI: read-only balances, and BTC to cbBTC through Ledger's swap if a provider supports the pair.

## D4. MVP scope (decided 10 Oct)

See [SPEC.md](./SPEC.md), section 1. We checked on-chain that Morpho Blue runs on Base Sepolia with the 86% LLTV and the adaptive IRM enabled, so we can create our own market with mock tokens and a mock oracle. Until the mentors answer on Monday, we build on the assumptions in SPEC.md section 6.

## D5. Business model (decided 9 Oct)

A free tier for the plan and the explanations, a subscription for 24/7 protection, a small fee when a loan is opened, and distribution inside Ledger Wallet with revenue sharing.

For Ledger: swap fees on the BTC to cbBTC conversion, more use of Ledger Wallet, and a real use case for Agent Intent and the Key Ring.

## D6. Project name

Open. Business side decides by Sunday.
