# Disclosure

> Draft, to be confirmed by the team before submission (story S-001).

The hackathon started on 7 October 2026 at 15:00 CEST. The first commit of this repository is dated 8 October 2026 at 09:23 CEST.

## Before the hackathon

The team had discussed an earlier idea (a BTC borrowing copilot) and written a short concept note, text only. It is not in this repository. No code, designs or assets from before the hackathon are included here.

## History in this repository

- **8 to 10 October**: documentation for the BTC copilot idea (spec, ideation, decisions). Documentation only, no code. These files were moved out of the working tree on 11 October and remain in the git history.
- **From 10 October**: documentation for the clearing house POC, in `docs-clearing-house-web3/`.
- **From 11 October**: POC code, in `clearing-house-web3/`.

## Third-party code

- Ledger Device Management Kit and Ethereum signer kit (`LedgerHQ/device-sdk-ts`, Apache-2.0).
- OpenZeppelin Contracts and merkle-tree (MIT).
- Other dependencies are listed in the package files.
- The Ledger agent skills (`LedgerHQ/agent-skills`) were used as reference documentation. They have no declared license and are not copied in this repository.

Code adapted from documentation or examples has a comment with a link to the source.

## AI tools

We used Claude as a tool: to question our choices, to explain documentation, to write and review documentation, and to suggest code that we then read, tested and changed. The product choices, the architecture, the financial logic and the integration are ours.
