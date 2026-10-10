# Build spec

Last update: 10 Oct 2026. The why is in [IDEATION.md](./IDEATION.md) and the decisions in [DECISIONS.md](./DECISIONS.md).

## 1. Scope

The demo needs all of this:

1. Connect a Ledger Flex from the web app (DMK over WebHID).
2. Sign the risk rules on the Flex as plain text.
3. Turn a goal like "€5,000 in March" into a plan: collateral, loan, liquidation price, cost, and a comparison with selling.
4. Check the plan against the signed rules with plain code, no LLM involved.
5. Decode the calldata and compare it with the plan before anything goes to the Flex.
6. Sign approve, supplyCollateral and borrow on the Flex, then execute them on Morpho Blue (Base Sepolia).
7. Protection Vault: the user funds it with a USDC transfer, and `protect()` repays their debt when the LTV crosses the threshold they signed.
8. A monitoring loop, plus a mock oracle so we can fake a crash during the demo.
9. A prompt injection that the rules block.
10. The user's profile and rules stored encrypted with the Key Ring.

If we have time left:

- Agent Intent for the cash-out transfer (depends on whether it supports Base)
- A short clip on Base mainnet with real cbBTC/USDC, if testnet tokens look bad on the Flex
- Running the agent on a server

For the pitch only: tBTC instead of cbBTC, BTC to cbBTC through Ledger's swap, mobile approvals, an app inside Ledger Wallet, the collar and the basis trade.

## 2. Architecture

```
web app (React, viem, DMK)  <-- WebHID -->  Ledger Flex
        |
        | HTTP
        v
agent server (Node, TypeScript)  -- RPC -->  Base Sepolia
  LLM with tools                              Morpho Blue
  planner (plain math)                        MockCBBTC, MockUSDC
  rules check                                 MockOracle
  calldata check                              ProtectionVault
  monitor, calls protect()
  Key Ring through wallet-cli
```

The LLM never writes a number or a transaction. It calls tools, and our code does the math and builds the calldata.

```
contracts/   Foundry: mocks, oracle, vault, tests, deploy scripts
agent/       Node + TypeScript
web/         Vite + React
docs/
```

## 3. On-chain

We checked on 10 Oct. Morpho Blue runs on Base Sepolia at `0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb`, and the Clear Signing registry has a descriptor for that address on chain 84532. The enabled LLTVs include 86%. The enabled IRMs are `0x46415998764C29aB2a25CbeA6254146D50D22687` (adaptive curve) and `address(0)`.

So we create our own market:

| Param | Value |
|---|---|
| loanToken | MockUSDC, 6 decimals |
| collateralToken | MockCBBTC, 8 decimals |
| oracle | MockOracle (we set the price) |
| irm | 0x4641...2687 |
| lltv | 0.86e18, same as the real cbBTC/USDC market |

We supply the MockUSDC liquidity ourselves.

**MockOracle.** It implements Morpho's `IOracle.price()`, which is the price of one unit of collateral in loan units, scaled by 1e36. At $100k per BTC, that gives `100_000 * 1e6 * 1e36 / 1e8`. `setPrice()` can only be called by a demo key, and the UI shows that button as a demo control.

**ProtectionVault.**
- `owner` is the user's Ledger address. `agent` is a separate key that only holds gas.
- The user funds it with a normal USDC transfer, which the Flex already shows in clear.
- `protect()` can only be called by `agent`. It reads the owner's position and the market's oracle, computes the LTV, and reverts if the LTV is under `triggerLtv`. Otherwise it repays enough to bring the LTV back to `targetLtv`, up to `maxRepayPerCall` and whatever the vault holds.
- The repayment goes through `morpho.repay(..., onBehalf = owner)`. Morpho lets anyone repay a borrower's debt, so the vault needs no permission on the position.
- `setParams()` and `withdraw()` are owner only. They will be blind signed unless we write an ERC-7730 descriptor for the vault.
- The money can only go two places: to Morpho to repay the owner's debt, or back to the owner.

## 4. User journey

| # | Step | How | Ledger part | On the Flex |
|---|---|---|---|---|
| 1 | Connect | DMK over WebHID | DMK, Ethereum signer | Open the Ethereum app |
| 2 | Set rules (max LTV 30%, max loan, trigger 70%, target 50%) | Rules form in the app | Signature (EIP-191 text) | The rules as text |
| 3 | Store profile and rules | `wallet-cli ring encrypt` on the agent side | Key Ring | Nothing after the first `ring init` |
| 4 | "I need €5,000 in early March" | Chat | | |
| 5 | Build the plan | LLM calls `get_position`, `get_price`, `plan_loan` | | |
| 6 | Explain it | LLM writes from the tool outputs only | | |
| 7 | Check the rules | Verify the rules signature, then LTV, caps, market | | |
| 8 | Check the calldata | Decode with viem and compare each field with the plan | | |
| 9 | Execute | approve, supplyCollateral, borrow | Clear Signing (Morpho descriptor) | Action and amounts |
| 10 | Fund the vault | USDC transfer | Clear Signing (token transfer) | Amount and address |
| 11 | Cash out (if time) | Agent proposes USDC to the user's exchange address | Agent Intent | Send details |
| 12 | Watch | Every 15 s: oracle price, position, LTV | | |
| 13 | Early warning | Above the alert level, the app proposes "repay X or add Y", valid 24 h | Signed if accepted | Repay or supply collateral |
| 14 | Crash | Above `triggerLtv`, the agent calls `vault.protect()` on its own | None: the owner already signed the vault settings | |
| 15 | Close | Repay, then withdraw the collateral | Clear Signing | Repay, withdraw |

**Injection scene.** We feed the agent a fake news item that hides an instruction to borrow the max. The agent proposes it, and the rules check refuses: "LTV 78% is above your signed limit of 30%". It never reaches the Flex.

## 5. Demo video (3 min max)

1. Thomas has 0.4 BTC and needs €5k without selling.
2. Connect the Flex and sign the rules.
3. Ask for the €5k, show the plan and the calldata check.
4. Sign supplyCollateral and borrow, with close-ups of the Flex screen.
5. Fund the vault.
6. Injection attempt, refused.
7. Fake a 35% drop: alert, then the vault repays and the LTV is safe again.
8. End on the two lines from the README.

## 6. Mentor questions (answers expected Monday)

| Question | We build assuming | If the answer is bad |
|---|---|---|
| 1. Clear Signing on testnet | It works | Film the borrow on Base mainnet with about $20 |
| 2. originToken | We don't need it | Ask for one, film on mainnet if needed, note it in the DX feedback |
| 3. Agent Intent chains | Not in the base demo | Leave it in the roadmap and the DX feedback |
| 4. Key Ring on a server | The agent runs on the laptop | Server stays in the roadmap |
| 5. Signing the rules | EIP-191 text | |

## 7. Plan (Paris time)

| Day | Engineering | Business |
|---|---|---|
| Sat 10 | Check that the Flex connects in Chrome, that wallet-cli installs on Windows and that `ring init` works. Then the contracts, tests, deployment, market creation and liquidity. | Name, 5 interviews or an X poll, pitch outline, first draft of the post |
| Sun 11 | Agent server (tools, planner, rules check, LLM). Web app: chat, plan, signing the rules, the borrow flow. | More interviews, competitors (DeFi Saver, Coinbase BTC loans), pitch story |
| Mon 12 | Monitoring, `protect()`, fake crash, injection scene, Key Ring, changes after the mentors answer | Video script, README problem and business parts, post v2 |
| Tue 13 | Feature freeze at 14:00, cleanup, README, DX feedback, video done by 18:00 | Post published by 20:00, form sent by 21:00, repo made public |
| Wed 14, Thu 15 | Pitch deck and rehearsals | Same |
| Fri 16 | Pitch at Ledger HQ, 15:00 | |
