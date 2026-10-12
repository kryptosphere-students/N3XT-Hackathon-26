# Clearing House web3 · Ledger N3XT Hackathon 2026

A settlement engine for fund units, with Ledger signatures and AI agents. Built by the Kryptosphere team for the Ledger N3XT hackathon (OP3N 2026).

## What it does

Fund managers sign subscription and redemption orders on a Ledger device. A deterministic engine checks each order against a mandate the manager signed, verifies the NAV, and settles fund units against cash on Base Sepolia, delivery versus payment:

- **instant mode**: each order is settled as soon as it is executed;
- **netting mode**: the orders of a cycle are netted, and only net balances are settled.

Orders often arrive by email. An AI agent reads them, drafts the instruction and explains it; our code checks it against the signed mandate, and the manager signs it on the Ledger. Another agent checks the NAV. Agents never sign and never compute an amount.

## Who signs what

| Action | Done by | Approved by |
|---|---|---|
| Mandate rules (cap per cycle, allowed funds) | Fund manager | Ledger device, EIP-191 |
| Draft order from an email | Agent | None, it's only a draft |
| Subscription or redemption order | Fund manager | Ledger device, EIP-191 text |
| NAV check and explanation | Agent | None, read only |
| Netting and coverage check | Deterministic code | None, reproducible |
| Approval of a lot (what I receive, what I pay) | Each participant | Ledger device, EIP-191 text |
| DvP settlement transaction | Engine, only once every approval is valid | Signatures published on-chain |
| Order from a trapped email | Agent drafts it | Refused by the signed mandate, never reaches the device |

## Status

Contracts deployed on Base Sepolia (12 Oct). Flex connection, three derived accounts, mandate and order signatures tested on the device (11 and 12 Oct, `clearing-house-web3/apps/web/README.md`). The code is in `clearing-house-web3/`.

## Deployed contracts (Base Sepolia, chain id 84532)

| Contract | Address | Explorer |
|---|---|---|
| ShareToken (Fund F units, 6 decimals, whitelist) | `0x599d84b195A79B3e8E90a4B0dF744057055b6ccc` | [sepolia.basescan.org](https://sepolia.basescan.org/address/0x599d84b195A79B3e8E90a4B0dF744057055b6ccc#code) |
| MockCash (test cash, 6 decimals) | `0xdb1D8fb204785C533DB8F3426f8DEf5ba81686b1` | [sepolia.basescan.org](https://sepolia.basescan.org/address/0xdb1D8fb204785C533DB8F3426f8DEf5ba81686b1#code) |
| SettlementEscrow (prefunded DvP, `settle(lot)`, `LotSettled`) | `0xeBc2456c49a5E29c69D68258A8865E3f8A694AcE` | [sepolia.basescan.org](https://sepolia.basescan.org/address/0xeBc2456c49a5E29c69D68258A8865E3f8A694AcE#code) |

Deployed by `0xb9d8118635755abCf21DaA6dEd46f964702F8ffC`, which is also the fund's account. The engine role is `0x9970E02eD7D7Ec45749862fd000c093f66649F3A`. Managers A, B and C (three accounts of one Ledger Flex) are whitelisted and prefunded in the escrow. Source verified on Basescan with `forge verify-contract`.

## Repository layout

| Path | Content |
|---|---|
| `clearing-house-web3/` | POC code: contracts, engine, server, web |
| `docs-clearing-house-web3/` | Product docs (French): framing, POC spec, technical diagram, backlog, open questions, pitch outline, developer guide |
| `DISCLOSURE.md` | What existed before the hackathon |
| `DECISIONS.md` | Decision log |
| `DX_FEEDBACK.md` | Developer experience log on the Ledger stack |

## Start here

- Developers: `docs-clearing-house-web3/dev/README.md`
- Jury: this file, then `DISCLOSURE.md` and `DX_FEEDBACK.md`

## License

MIT, see `LICENSE`.
