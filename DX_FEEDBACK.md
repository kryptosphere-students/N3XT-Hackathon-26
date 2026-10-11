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
| 11 Oct | Docs (AI Tools) | Read the pages linked from the brief: Clear Signing, Wallet Provider, Security Key, OpenPGP, DMK how-to | Overview pages only, no code samples, links to sub-pages | — | Used the `LedgerHQ/agent-skills` repo, which has the full command and code reference |
| 11 Oct | DMK signer, Clear Signing | Find out what happens without an `originToken` | The DMK skill says the device shows raw hex; the signer setup page says Transaction Checks are unavailable. Not the same statement | — | To test on the Flex (S-006) and ask on Discord |
| 11 Oct | wallet-cli | Plan to use wallet-cli on Base Sepolia | The skill lists `send`, `receive` and swaps on testnets and L2s as out of scope. The overview page does not say so | — | wallet-cli used for Key Ring only, transactions go through the DMK |
| 11 Oct | DMK packages | Check versions against the skill | npm has DMK 1.11.0 and Ethereum signer 1.18.1; the skill's known-working versions are 1.2.0 and 1.12.0 | — | Check API signatures against the npm types |
| 11 Oct | agent-skills repo | Reuse skill content in our repo | No license declared on the repo | — | Cite only, do not copy |
