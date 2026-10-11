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

Documentation and backlog are ready. Flex connection and signing tested on 11 Oct (`clearing-house-web3/apps/web/README.md`). The code starts in `clearing-house-web3/`.

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
