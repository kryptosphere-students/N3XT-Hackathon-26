# Ideation — v1 (9 Oct 2026)

Living document. Decisions are logged in [DECISIONS.md](./DECISIONS.md).

## 1. Problem
Long-term BTC holders sometimes need cash: an apartment deposit, a project, an emergency. Today they face three options:
- **Sell:** they lose their BTC exposure.
- **Borrow from a centralized lender:** they hand over their coins. Celsius and BlockFi did not end well.
- **Borrow in DeFi themselves:** complex, risky (liquidation), and a lot of blind signing.

Ledger users self-custody precisely because they want neither to sell nor to hand over their coins.

## 2. Promise
> Get cash from your BTC without selling it and without handing it to a lender. An AI plans and explains; your Ledger decides.

*Wording note:* we say "without handing it to a lender", not "to anyone". On Base, BTC is used as cbBTC, a token backed 1:1 by BTC that Coinbase holds. That wrapper is a trust point and we state it openly (see §8).

## 3. Persona and journey (v1)
**Thomas, 34**, has held 0.4 BTC on a Ledger Flex since 2020. He needs €5,000 in early March and does not want to sell.

1. **Connect:** the Flex is plugged in and the agent reads his accounts (read-only).
2. **Rules:** Thomas sets his limits (max LTV 30%, max loan). He **signs them on the Flex**, and they are stored **encrypted with the Key Ring**.
3. **Ask:** "I need €5,000 in early March without selling my BTC."
4. **Plan, explained:** collateral, loan amount, liquidation price and the drop it represents, estimated cost, and a comparison with selling.
5. **Check:** deterministic rules approve or block the plan, with the reason.
6. **Sign:** every transaction is shown in clear on the Flex.
7. **Cash out:** USDC is sent to his exchange account to get euros.
8. **Watch, 24/7, read-only:** early proposals with an expiry date; in a crash, the Protection Vault repays automatically within the limits he signed.
9. **Close:** a repayment plan when Thomas decides.

*Step 3 of ideation: detail how each step is built.*

## 4. Architecture: three layers
| Layer | Role | Can it move funds? |
|---|---|---|
| **AI (LLM)** | Understands the need, plans, explains, prepares transactions | No |
| **Policy engine** (deterministic code + on-chain vault) | Checks every proposal against the signed policy; the vault can only *reduce* risk | Only to repay the user's own debt, within signed limits |
| **Ledger Flex** | Human approval of every risk-adding action and every policy change | Yes, with a physical confirmation |

**Asymmetric autonomy:** the agent can make you safer on its own. Anything that adds risk needs your Ledger.

**Two Ledger primitives, two jobs:** *the Key Ring stops anyone from reading your data; the Ledger signature stops anyone from changing your rules.*
- **Key Ring:** the user's profile (holdings, address, goal) and the agent's secrets are stored encrypted under a key derived from the user's Ledger. A breached server leaks nothing readable.
- **Ledger signature on the policy:** every version of the rules (max LTV, caps) must be signed on the Flex. The policy engine rejects unsigned rules, so neither a prompt injection nor a compromised agent can loosen them silently.

### Data the agent relies on (oracles)
Liquidation on Morpho is decided by **the oracle of the market**, not by the price on an exchange. So:
- The agent, the policy engine and the Protection Vault all compute LTV with **the same oracle as the Morpho market** (the `oracle` field of the market parameters, read on-chain). The Protection Vault reads it on-chain itself.
- Off-chain market data (price history, volatility) is used **only for planning and early alerts**, never as the trigger of an on-chain action.
- Every number the agent explains (liquidation price, LTV) comes from deterministic code, not from the LLM.

## 5. Innovation
1. **Asymmetric autonomy:** a new kind of agent/human boundary.
2. **"What the AI told you = what your Ledger shows":** the decoded transaction is checked against the AI's explanation before signing.
3. **Goal-based, self-custodial credit:** a new Ledger use case built for Ledger's core user.

## 6. Business model
- **Freemium:** the plan and explanations are free.
- **Subscription:** 24/7 protection.
- **Interface fee:** charged when a loan is opened.
- **Distribution:** inside Ledger Wallet, with revenue sharing.

## 7. Value for Ledger
- The BTC to cbBTC conversion goes through **Ledger's swap**, which earns Ledger fees.
- **More engagement** on Ledger Wallet.
- A **showcase for Agent Intent and the Key Ring**.
- Real-world **DX feedback** on the Agent Stack.

## 8. Out of scope for the hackathon (roadmap)
- Zero-cost collar and basis trade
- tBTC (Threshold): BTC held by a decentralized network of signers instead of a single company. It removes the cbBTC trust point.
- Mobile approvals
