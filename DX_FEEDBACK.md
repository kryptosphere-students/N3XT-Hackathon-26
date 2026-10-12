# Developer experience feedback

Notes on building with the Ledger stack. We log problems as they happen and write the summary at the end.

## Summary

1. Where the docs lost us:
2. The workflow that confused us:
3. What context was missing:
4. One concrete suggestion:

## Log

| Date | Tool | What we tried | What happened | Time lost | How we fixed it |
|---|---|---|---|---|---|
| 11 Oct | Docs (AI Tools) | Read the pages linked from the brief: Clear Signing, Wallet Provider, Security Key, OpenPGP, DMK how-to | Overview pages only, no code samples, links to sub-pages | n/a | Used the `LedgerHQ/agent-skills` repo, which has the full command and code reference |
| 11 Oct | DMK signer, Clear Signing | Find out what happens without an `originToken` | The DMK skill says the device shows raw hex; the signer setup page says Transaction Checks are unavailable. Not the same statement | n/a | To test on the Flex (S-006) and ask on Discord |
| 11 Oct | wallet-cli | Plan to use wallet-cli on Base Sepolia | The skill lists `send`, `receive` and swaps on testnets and L2s as out of scope. The overview page does not say so | n/a | wallet-cli used for Key Ring only, transactions go through the DMK |
| 11 Oct | DMK packages | Check versions against the skill | npm has DMK 1.11.0 and Ethereum signer 1.18.1; the skill's known-working versions are 1.2.0 and 1.12.0 | n/a | Check API signatures against the npm types |
| 11 Oct | agent-skills repo | Reuse skill content in our repo | No license declared on the repo | n/a | Cite only, do not copy |
| 10 Oct | Docs | Open the "how to use a signer" link from the Discord welcome message | 404: the link has `dmk--ts`, the working URL has `dmk-ts` | 5 min | Fixed the URL by hand |
| 10 Oct | Docs | Set up the Ethereum signer | The builder parameter is `dmk` on the how-to page and `sdk` on the reference page | 5 min | `dmk` works with signer 1.18.1 |
| 11 Oct | DMK, WebHID | Connect the Flex from a Vite + React page and read the address with `getAddress` (checked on device) | Worked on the first try in Chrome on Windows, once Ledger Wallet was closed. Nothing in the docs says Ledger Wallet must be closed | 0 | Closed Ledger Wallet |
| 11 Oct | npm | Install DMK 1.11.0, web-hid 1.2.4, signer-eth 1.18.1 | npm warns that `crypto-js@4.2.0` is deprecated. It comes from `@ledgerhq/context-module` 2.6.0. Plus 9 audit warnings (8 moderate, 1 high) | 0 | Ignored for the prototype, worth fixing upstream |
| 11 Oct | Signer, EIP-191 | `signMessage` with a 4-line text (S-006) | Readable on the Flex, line breaks included | 0 | Used for every human signature |
| 11 Oct | Signer, EIP-712 | `signTypedData` with our own types, no descriptor (S-006) | An opt-in screen for Transaction Check appears first, not mentioned in the signer docs. Then "cannot be clear-signed, enable blind signing". After rejecting, the error is `6a80 Invalid data`, which reads like a bug in our data rather than "refused, blind signing is off" | 20 min | Switched to EIP-191. Suggestions: a specific error for "blind signing disabled", and a way to test an ERC-7730 descriptor locally before the registry merge |
| 12 Oct | Clear Signing (mentor answer) | Asked whether our own EIP-712 types could be clear-signed | Outside the ERC-7730 registry it is blind signing, no exception for a hackathon | n/a | EIP-191 text for every human signature (D6) |
| 12 Oct | originToken (mentor answer) | Asked what the `originToken` changes | It is required for Transaction Check and Clear Signing. Without it the signer still works for plain text | n/a | No token needed for our EIP-191 flow, noted in the README |
| 12 Oct | Agent Intent (mentor answer) | Asked whether Agent Intent could send on Base Sepolia | Ethereum mainnet only, ETH and known ERC-20, no Base, no testnet | n/a | Agent Intent stays in the roadmap |
| 12 Oct | Key Ring (mentor answer) | Asked how to share a Key Ring between machines and call it from code | Each machine runs `ring init` with the Ledger plugged in. CLI only, to be called as a subprocess, no library | n/a | Key Ring kept as a bonus (D12) |
| 12 Oct | Signed config (mentor answer) | Showed the idea of signing a small config text on the Ledger | "Interesting for us as a reference" | n/a | Kept the mandate signed as text (S-019) |
