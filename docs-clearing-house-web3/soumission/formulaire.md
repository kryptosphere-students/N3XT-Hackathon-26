# Submission form, answers ready to paste

Form: https://forms.gle/sGCimWsRCrDKE93S7 (one answer per team, edit the answer to change it, do not resubmit). Deadline 13 Oct 2026, 23:59 CEST.

## Project name

Cendro, settlement engine for tokenized funds

## One line

A settlement engine for fund units where an AI agent drafts orders from emails, deterministic code checks them against a mandate signed on a Ledger Flex, and participants approve each settlement on the device.

## Project description (150 words)

Fund units are still settled by hand: orders arrive by email, a back office retypes them, and cash and units move days later. Cendro is a settlement engine for tokenized funds, here with three participants and one fund. An AI agent reads the email and drafts the order with a single whitelisted tool. It never computes an amount and never signs. Our code checks the draft against a mandate the manager signed on a Ledger Flex: allowed fund, allowed sides, cash cap per cycle. The manager then reads the order on the Flex and signs it, as plain text. The engine nets the cycle, each participant approves on the device what it receives and what it pays, with the lot hash, and the escrow settles units against cash in one transaction on Base Sepolia. Instant mode settles one order alone through the same contract. The trapped email of the demo is refused by the mandate and never reaches the device.

## Team and club

Team name: Kryptosphere. Club: Kryptosphere (student association, France). Team of two, both present in Paris for the final.

- Mark-Killian Zinenberg, engineering: contracts, Ledger integration (DMK, Key Ring), server, web.
- Louis, business and finance: settlement engine design (netting, coverage, NAV), agent content, pitch.

## Ledger tools used

Device Management Kit with the Ethereum signer over WebHID (`getAddress` with on-device check, `signMessage` EIP-191 for the mandate, each order and each lot approval), and Ledger Key Ring (`wallet-cli ring`) to keep the agent's LLM key encrypted and decrypted at startup in a subprocess. Clear Signing was tested and ruled out for our own types (blind signing without an ERC-7730 descriptor), which is why every human signature is readable text.

## Links

- Repository: [TODO GitHub URL]
- Demo video: [TODO video URL]
- Deployed escrow on Base Sepolia: https://sepolia.basescan.org/address/0xeBc2456c49a5E29c69D68258A8865E3f8A694AcE#code
- Club post: [TODO X or LinkedIn URL]

## Pre-existing code

None. The repository was created on 8 October 2026. Before the hackathon the team only had a text concept note about another idea, not included. Third-party code: Ledger DMK and signer kits, OpenZeppelin Contracts, forge-std, viem, Fastify, Vite, React. See `DISCLOSURE.md`.

## Developer experience feedback (4 points)

1. Where the docs lost us: the Clear Signing pages explain the ERC-7730 registry but do not say plainly that a hackathon project with its own EIP-712 types will get the blind signing prompt. We only learned it on the device, after a `6a80 Invalid data` error that reads like a data bug, and then from the mentors. One sentence on the signer page would have saved the afternoon.

2. The workflow that confused us: the signer builder is `dmk` on the how-to page and `sdk` on the reference page, and the link from the Discord welcome message had `dmk--ts` instead of `dmk-ts`. Small things, but each one costs five minutes to a newcomer.

3. What context was missing: nothing says Ledger Wallet must be closed for WebHID to see the device from Chrome. And `wallet-cli` switches to a JSON envelope when stdout is not a terminal, even without `--output json`, which matters when a server calls `ring decrypt` in a subprocess.

4. One concrete suggestion: a specific error for "blind signing is disabled on the device" instead of `6a80`, and a way to test an ERC-7730 descriptor locally before the registry merge. Also an `originToken` note in the signer quick start: without it plain text signing works, Transaction Check and Clear Signing do not.

## Category

An AI use case around a Ledger signer (the agent drafts, the device approves).
