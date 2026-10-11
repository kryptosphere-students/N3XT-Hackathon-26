# Ledger Hackathon Docs

Rules et skills dérivés du brief `LEDGER OP3N STUDENTS 2026.md` et de la documentation Ledger référencée dedans. Déposés ici pour review, pas encore intégrés à `.claude/`.

## Contenu

### Rules (`rules/`)

| Fichier | Contenu |
|---|---|
| `10-hackathon-brief.md` | Périmètre, équipe, soumission, dates, critères, prix, propriété |
| `11-ledger-security-rules.md` | Secrets, approbation humaine, signature, Clear Signing, cycle de vie des clés |
| `12-agent-human-boundary.md` | Format du tableau agent autonome / humain approuve |

### Skills (`skills/`)

| Skill | Source principale | Sert à |
|---|---|---|
| `ledger-architecture-advisor` | Brief + toutes les docs | Choisir l'outil selon l'idée, dessiner l'architecture |
| `ledger-hackathon-brief` | Brief | Process, soumission, pitch, write-up DX |
| `ledger-agent-stack-wallet-cli` | `wallet-cli-usage/SKILL.md` + page Ledger CLI | Commandes wallet, sandbox, erreurs |
| `ledger-key-ring` | Page Ledger CLI (section Key Ring), `wallet-cli-usage` | Secrets chiffrés, usage headless |
| `ledger-agent-intent` | `wallet-cli-usage` (section Agent Intent) | Agent qui propose, humain qui approuve |
| `ledger-dmk-signer` | `ledger-dmk-implementation`, `dmk-sdk-reference`, `dmk-code-patterns`, page DMK | Intégration DMK TypeScript et signers |
| `ledger-clear-signing` | Page Clear Signing, page Wallet Provider | ERC-7730, `originToken`, Wallet Provider |
| `ledger-hardware-security` | Pages Security Key et OpenPGP | FIDO2, OpenPGP, choix vs Key Ring |

## Sources

Consultées le 11 oct. 2026 :

- Brief : `ledger-hackathon-docs/LEDGER OP3N STUDENTS 2026.md`
- `developers.ledger.com/docs/ai-tools/overview`
- `developers.ledger.com/docs/ai-tools/ledger-cli`
- `developers.ledger.com/docs/ai-tools/ledger-dmk-skills`
- `developers.ledger.com/docs/device-interaction/dmk-ts/integration/how_to/how_to_use_a_signer`
- `developers.ledger.com/docs/device-interaction/dmk-ts/integration/how_to/dmk`
- `developers.ledger.com/docs/ledger-wallet-provider/overview`
- `developers.ledger.com/docs/clear-signing/overview`
- `developers.ledger.com/docs/ai-tools/hardware-security/security-key`
- `developers.ledger.com/docs/ai-tools/hardware-security/open-pgp`
- **Dépôt `github.com/LedgerHQ/agent-skills`** (commit `8325d5b`, 6 oct. 2026) : c'est la source la plus complète. Les SKILL.md de `wallet-cli-usage` et `dmk/` ont été lus en entier et sont synthétisés ici.

## Limites connues

- **Pages Ledger partielles.** Wallet Provider, Clear Signing, Security Key et OpenPGP renvoient vers des sous-pages ou n'ont pas de code. Ces zones sont marquées « à vérifier » dans les skills concernés.
- **Versions** : les versions de paquets indiquées viennent d'un fetch du 11 oct. 2026. Les revérifier avec `npm view` avant de coder.
- **Nommage** : le brief dit « Ring CLI », la doc dit « Key Ring », le binaire dit `wallet-cli ring`. Ce sont les mêmes outils.
- **Divergence possible** : la doc web et le dépôt `agent-skills` peuvent diverger. Le dépôt et les types npm font foi.
- **Skills en développement précoce** selon Ledger : des changements incompatibles sont possibles.

## Pour review

1. Relire `rules/` : ce sont les règles qui pourraient être appliquées aux équipes.
2. Vérifier `ledger-architecture-advisor` : c'est le skill qui oriente les choix d'architecture.
3. Confirmer le dossier cible : ces fichiers pourraient être déplacés vers `.claude/rules/` et `.claude/skills/` du repo.

Rien n'est committé. Ce dossier est dans le working tree.
