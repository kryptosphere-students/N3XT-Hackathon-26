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

## Proposed, waiting for team validation

- **Submission**: the clearing house POC is the single project submitted (one submission per team).
- **Device**: one Ledger Flex with three derived accounts (`44'/60'/n'/0/0`).
- **Settlement approval**: the engine prepares, a human approves each settlement on the Flex. The agent wallet only publishes NAV hashes.
- **Signing format**: EIP-712 with Clear Signing if the test on the Flex is readable, EIP-191 otherwise.
- **LLM**: `claude-opus-5-5`, spending cap of 50 USD.
