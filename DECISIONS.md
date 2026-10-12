# Decisions

Earlier decisions about the BTC copilot idea are in the git history (`archive/DECISIONS.md`). Details for each entry below are in `docs-clearing-house-web3/`.

## Decided

### D1. One engine, two settlement modes (11 Oct)

Instant mode settles each order as soon as it is executed, as a lot of size 1. Netting mode settles the net balances of a cycle. Both go through the same `settle(lot)` function.

### D2. The value is technical, not monetary (11 Oct)

The service brings no funds. Its value is speed, security (every order signed on a Ledger, mandate rules enforced by code) and verifiability (deterministic computation, hashes published on-chain). Netting lowers the cash participants must lock: a gain for them, presented as a consequence. Prefunding net balances is a constraint brought by the participants, not a benefit of the service.

### D3. NAV computed off-chain, hashes published on-chain (11 Oct)

The NAV is computed by deterministic off-chain code. The hashes of its inputs and of the result are published on-chain. On-chain NAV with a price oracle is after the hackathon. The NAV stays a legal act of the fund administrator.

### D4. Target clients (11 Oct)

Fund depositaries and administrators: CACEIS as the verified reference, BP2S and SGSS to qualify. Central securities depositories (Euroclear, Clearstream) are a secondary target: they already settle DvP through T2S and their buying cycles are long.

### D5. Code location (11 Oct)

The code lives in `clearing-house-web3/`, next to the documentation. Taken while organising the repository, to be confirmed by the team.

### D6. Every human signature is EIP-191 text (11 Oct)

Tested on the Flex (S-006). Plain text signed with `signMessage` is readable, line breaks included. Our own EIP-712 types are not: the Flex asks to enable blind signing. A call to our own contracts, or an `approve` on our test tokens, would have the same problem.

So participants sign three kinds of readable text on the Flex: their mandate rules, each order, and their approval of a lot. The server checks every signature. Participants are prefunded in the escrow at deployment, and the engine key sends `settle(lot)` once all approvals are valid. The signatures go on-chain in the `LotSettled` event, so anyone can check them afterwards. Checking them inside the contract is roadmap.

Confirmed by the Ledger mentors on 12 Oct: outside the ERC-7730 registry it is blind signing, and the `originToken` is required for Transaction Check and Clear Signing, not for plain text. Signing a small config on the Ledger, which is what the mandate is, was called interesting for them as a reference.

### D7. An order intake agent puts the AI at the center (11 Oct)

Orders often arrive by email today and are typed in again by a back office. The agent reads the email, drafts the instruction through a whitelisted tool, and explains it. Our code checks it against the signed mandate, and the manager signs it on the Flex. The injection scene uses a trapped email. Story S-044.

### D8. Smaller scope (11 Oct)

One `LotSettled` event with the lot hash, the NAV hash and the signatures, instead of a Merkle root plus a separate NAV event. JSON files instead of SQLite. The Merkle root moves to the roadmap.

### D9. The project submitted is the clearing house (11 Oct)

Decided by Mark and Louis. The BTC copilot docs stay in the git history.

### D10. Local tooling stays out of the repo (11 Oct)

The Claude Code configuration (`.claude/`) and our copy of the hackathon brief stay on our machines. They are not our product and the brief is Ledger's document.

### D11. Lot format: net balances per participant (11 Oct)

A lot is a list of net positions, one per participant, for one fund. The fund itself is a participant. Each position has a share amount and a cash amount with a sign: positive means the participant receives, negative means it pays or delivers. Shares and cash both use 6 decimals. `navPerUnit` is the cash paid for one share. Cash is rounded down per order, and the fund's line takes the opposite of the sum of the other lines, so every lot sums to zero. The escrow holds prefunded internal balances per participant and settles a lot by moving those balances. Types live in `packages/engine/src/types.ts`.

### D12. Who does what, what is cut, which LLM (12 Oct)

Mark: contracts, signatures, agent plumbing (S-029, S-027, S-044), web interface. Louis: engine (S-015 to S-018), mandate check S-026, agent content (system prompt, three demo emails), NAV mock and hashes (S-024, S-041).

Cut: S-025 (the NAV check is done by code, not by an agent) and S-033 (a link to the block explorer is enough). S-023 Key Ring is a bonus, only if time is left.

The LLM goes through OpenRouter (OpenAI compatible API), not through the Anthropic SDK. Model and fallback model come from `.env`.

Mentor answers on 12 Oct that confirm the cuts: Agent Intent works on Ethereum mainnet only (ETH and known ERC-20, no Base, no testnet), so it stays in the roadmap. Key Ring needs `ring init` on every machine with the Ledger plugged in, CLI only, called as a subprocess, so it stays a bonus.

### D13. The engine was coded by Mark, Louis reviews it (12 Oct)

The engine functions agreed on 12 Oct (`netPositions`, `checkCoverage`, `lotHash`, `checkInstruction`, `navHash`) were first written as a provisional adapter in the server, then moved to `packages/engine` on the evening of 12 Oct with their tests, so the submission has one engine. Louis reviews them, in particular the rounding of cash per order and the cap check per cycle. The `Mandate` type moved to `packages/engine/src/types.ts` for the same reason.

## Proposed, waiting for team validation

- **Device**: one Ledger Flex with three derived accounts (`44'/60'/n'/0/0`).
