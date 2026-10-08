# <Project name>

> One-line pitch. *(to finalize after ideation)*

Built by **Kryptosphere** for the **Ledger N3XT Hackathon @ Ledger OP3N 2026** · #LedgerN3XTCollab

---

## The problem
<!-- Who suffers, how often, how much it costs them today. 3–4 lines max. -->

## What it does
<!-- 3 bullets. What the user experiences, not how it's built. -->

## Demo
- 🎥 Video: <link>
- ▶️ Try it: see [Run it locally](#run-it-locally)

## Who decides what — agent vs. human
The judges explicitly look for this boundary. Keep this table accurate.

| Step | Done by | Ledger primitive |
|---|---|---|
| e.g. Monitor position / risk | Agent (autonomous, read-only) | — |
| e.g. Prepare a transaction | Agent | Wallet CLI `--dry-run` |
| e.g. Check it against the user's policy | Deterministic code | Key Ring (encrypted policy) |
| e.g. Approve and sign | **Human, on the Ledger device** | Clear Signing / Agent Intent |

## Ledger stack used
<!-- Only list what is actually implemented, with a link to the file where it happens. -->
- [ ] Ledger Wallet CLI — `path/to/file`
- [ ] Ledger Agent Intent — `path/to/file`
- [ ] Ledger Key Ring (LKRP) — `path/to/file`
- [ ] DMK signer — `path/to/file`
- [ ] Clear Signing descriptor (ERC-7730) — `path/to/file`

## Architecture
<!-- One diagram + 5 lines. -->

## Run it locally
```bash
# prerequisites, install, configure (.env from .env.example), run
```

## Limitations & what's next
<!-- Be honest: what is mocked, what is out of scope, what the roadmap is. -->

## Developer-experience feedback
See [DX_FEEDBACK.md](./DX_FEEDBACK.md).

## Disclosure (pre-existing work & AI usage)
See [DISCLOSURE.md](./DISCLOSURE.md).

## Team
- <Name> — engineering · Kryptosphere
- <Name> — business & product · Kryptosphere

## License
MIT — see [LICENSE](./LICENSE).
