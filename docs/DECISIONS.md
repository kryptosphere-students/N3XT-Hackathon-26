# Decision log

One entry per decision we validate. Short entries: they become the backbone of the README and the pitch.

## D1 — Role of the AI agent
- **Status:** ✅ decided (8 Oct)
- **Options considered:**
  1. An autonomous agent that pilots positions
  2. The full Ouroboros protocol (lending + collar + basis trade) with an agent on top
  3. A pivot to a non-finance idea
  4. A three-layer copilot
- **Decision:** a three-layer copilot. **The AI proposes** (understands the need, plans, explains in plain language, prepares transactions). **Deterministic code checks** every proposal against the user's policy. **The Ledger decides:** the human signs on the device.
- **Why:**
  - Real problem for Ledger's core user: the long-term BTC holder who wants liquidity without selling and without handing coins to a CeFi lender.
  - Matches Ledger's "agent proposes, human approves" model and the brief's demand for an explicit agent/human boundary.
- **Consequences:**
  - The collar and the basis trade move to the roadmap.
  - We must answer the "3 a.m. crash" question (see D2).
  - We never pitch tax: the promise is "keep your BTC exposure".
- **Hardware:** Ledger Flex.

## D2 — Chain, protocol and autonomy model
- **Status:** 🟡 proposed (9 Oct). To validate with the team and the Ledger mentors.
- **Proposal:**
  - **Base**, with **Morpho Blue** and a **cbBTC/USDC** market. Morpho Blue already has an official Clear Signing descriptor on Base, Base Sepolia and Sepolia (supplyCollateral, borrow, repay, withdrawCollateral).
  - **Asymmetric autonomy through a "Protection Vault"** that we write. The user funds it with USDC through a plain token transfer. The agent can trigger only one action, `protect()`: repay the user's debt on Morpho, and only when the on-chain LTV is above the threshold the user signed. Morpho lets anyone repay on behalf of a borrower, so the vault needs no permission over the user's position.
- **Why:** clear signing works out of the box. Morpho is the same infrastructure Coinbase uses for its BTC-backed loans (to cite only once verified). Base gas is cheap.
- **Known trade-off:** cbBTC is custodied by Coinbase. We say so openly; tBTC (Threshold, which also has descriptors) is on the roadmap.
- **Demo network (proposed):** **Base Sepolia** as the main demo. Because we deploy our own mock oracle there, we can **simulate a BTC crash live** and show the Protection Vault reacting, which mainnet cannot do on demand. Optional: a short mainnet clip with ~$20 if the testnet display on the Flex is less readable (mock tokens may not show their names). Depends on the mentors' answers.

## D3 — Ledger primitives used (and where)
- **Status:** 🟡 proposed
- **DMK + Ethereum signer** (web app, WebHID): every lending transaction, clear-signed on the Flex, plus the signature of each policy version.
- **Key Ring** (Wallet CLI `ring`): encrypt the user's financial profile and the agent's secrets.
- **Agent Intent** (stretch goal): the agent proposes the cash-out transfer (USDC to the user's exchange account).
- **Wallet CLI**: read-only balances; BTC to cbBTC conversion through Ledger's swap if a provider supports the pair.

## D4 — MVP scope vs. roadmap
- **Status:** open (step 3: detail every journey step)

## D5 — Business model
- **Status:** ✅ decided (9 Oct)
- **Model:**
  - **Freemium:** the plan and explanations are free.
  - **Subscription:** 24/7 protection (monitoring plus the Protection Vault).
  - **Interface fee:** charged when a loan is opened.
  - **Distribution through Ledger Wallet**, with revenue sharing.
- **Value for Ledger (to state explicitly):**
  - The BTC to cbBTC conversion goes through Ledger's swap, which earns Ledger fees.
  - More engagement on Ledger Wallet.
  - A showcase for Agent Intent and the Key Ring.
