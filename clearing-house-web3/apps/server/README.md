# server

Fastify API, JSON files in `data/store/`, one LLM agent. Reads `clearing-house-web3/.env`.

```bash
npm run dev -w apps/server
npm test -w apps/server
```

Live call to the model (needs `OPENROUTER_API_KEY`, skipped otherwise):

```bash
set -a; source .env; set +a
npx vitest run intake.live -w apps/server
```

## Routes

| Route | What it does | Story |
|---|---|---|
| `GET /health` | Liveness and engine version | |
| `GET /config` | Fund names and addresses the browser may know | |
| `GET /participants/:address/nonces` | Next mandate and instruction nonce for a participant | S-019, S-020 |
| `POST /mandates` | Stores a mandate if its EIP-191 signature matches the text. 401 otherwise, 409 on a reused nonce | S-019, S-022 |
| `GET /mandates` | Signed mandates | |
| `POST /instructions` | Same checks for an order. Status `signed`. The mandate check (S-026) comes next | S-020, S-022 |
| `GET /instructions` | Signed instructions | |
| `POST /intake` | `{ emailText }` in, `{ draft, explanation, modelUsed, refusedTools }` out | S-044 |

Signed texts are built by `@chw3/protocol`, the same code the browser uses before asking the Flex. The server rebuilds the text from the fields and runs `verifyMessage` from viem: a field changed after signature gives a different text, so a 401.

## The agent and its boundary

`src/agents/`:

- `config.ts`: key, base URL, model and fallback model from `.env`, token cap per call (S-029).
- `llm.ts`: a fetch to an OpenAI compatible `chat/completions` (OpenRouter, D12). No SDK.
- `tools.ts`: the whitelist. One tool, `draft_instruction`, with a JSON schema for the model and a zod schema for us.
- `intake.ts`: the loop. Email in, at most two rounds, tool calls checked against the whitelist then the schema. If the main model fails, the fallback model is tried once.
- `prompts.ts`: provisional system prompt, to be replaced by Louis.

What the model does: read the email, pick the fund, the side, the units and the manager, explain in a sentence. What it never does: compute an amount, build a transaction, sign anything, call a tool outside the list. Units arrive as the string written in the email; our code converts it to a 6 decimal bigint. A draft is not an instruction: it becomes one only after the manager signs its text on the Flex (`POST /instructions`).

Checked on 12 Oct 2026 with `deepseek/deepseek-v4.1-flash` through OpenRouter: the clear email gives the right draft, the ambiguous one gives none, the trapped one (hidden note asking to redeem everything) gives the 10 units of the visible request and the note is called out in the explanation. No fallback was needed.
