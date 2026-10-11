# Ideation

Last update: 9 Oct 2026. Decisions are logged in [DECISIONS.md](./DECISIONS.md).

## Problem

People who have held BTC for years sometimes need cash, for an apartment deposit or an unexpected bill. They have three options today:

- Sell, and lose their BTC exposure.
- Borrow from a centralized lender and hand over their coins. Celsius and BlockFi showed how that can end.
- Borrow in DeFi themselves. It's complex, liquidation is a real risk, and they end up blind signing a lot.

Ledger users self-custody precisely because they want neither to sell nor to hand over their coins.

## What we're building

Get cash from your BTC without selling it and without handing it to a lender. An AI plans and explains; your Ledger decides.

We say "without handing it to a lender", not "without handing it to anyone". On Base, BTC is used as cbBTC, a token that Coinbase backs 1:1 with BTC it holds. That is a trust point, and we say it openly.

## Example user

Thomas, 34, has held 0.4 BTC on a Ledger Flex since 2020. He needs €5,000 in early March and doesn't want to sell.

1. He plugs in his Flex. The agent reads his accounts, read-only.
2. He sets his limits (max LTV 30%, a max loan amount), signs them on the Flex, and they are stored encrypted with the Key Ring.
3. He asks: "I need €5,000 in early March without selling my BTC."
4. The agent shows a plan: collateral, loan, liquidation price and how far the price can fall before it, cost, and what selling would look like instead.
5. Our code checks the plan against his rules and approves or blocks it, with the reason.
6. He signs each transaction on the Flex and can read it there.
7. He sends the USDC to his exchange account to get euros.
8. The agent keeps watching. If the price drops it warns him early, and its proposals expire. In a crash, the Protection Vault repays part of the loan within the limits he signed.
9. When he wants out, the agent prepares the repayment.

[SPEC.md](./SPEC.md) explains how each step is built.

## Three layers

| Layer | Role | Can it move funds? |
|---|---|---|
| LLM | Understands the request, plans, explains, prepares transactions | No |
| Our code and the vault | Check every proposal against the signed rules. The vault can only reduce risk. | Only to repay the user's own debt, within the signed limits |
| Ledger Flex | The user approves every action that adds risk and every change of rules | Yes, with a press on the device |

The agent can act alone only to make the user safer. Anything that adds risk needs the Ledger.

The Key Ring stops anyone from reading your data; the Ledger signature stops anyone from changing your rules.

- **Key Ring:** the profile (holdings, address, goal) and the agent's secrets are encrypted with a key derived from the user's Ledger. If the server leaks, nobody can read them.
- **Signed rules:** each version of the rules is signed on the Flex, and our code ignores rules that aren't signed. A prompt injection or a compromised agent can't loosen them.

## Price data

Morpho decides liquidations with the market's oracle, not with an exchange price. So the agent, the rules check and the vault all compute the LTV with that same oracle, read on-chain. Off-chain data such as price history or volatility only feeds the plan and the early warnings. It never triggers an on-chain action. Every number shown to the user comes from our code, never from the LLM.

## What's new

- The agent is autonomous only in the direction that protects the user.
- What the AI explains has to match what the Ledger will show, and we check it before signing.
- It gives Ledger's core users a use case built around a cash need, not trading.

## Business model

- Free: the plan and the explanations.
- Subscription: 24/7 protection.
- A small fee when a loan is opened.
- Distribution inside Ledger Wallet, with revenue sharing.

## What Ledger gets out of it

- The BTC to cbBTC conversion can go through Ledger's swap, which earns them fees.
- People use Ledger Wallet more.
- A real use case for Agent Intent and the Key Ring.
- Honest feedback on their developer tools.

## Later, not for the hackathon

- Zero-cost collar and basis trade.
- tBTC (Threshold), where BTC is held by a network of signers instead of one company.
- Approvals from a phone.
