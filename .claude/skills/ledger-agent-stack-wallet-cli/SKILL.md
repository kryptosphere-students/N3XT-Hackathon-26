---
name: ledger-agent-stack-wallet-cli
description: Utiliser le CLI Ledger (wallet-cli, Agent Stack) — installation, commandes compte, envoi, swap, earn, sandbox et contention USB, erreurs fréquentes. À charger dès qu'une commande wallet-cli doit être conçue, exécutée ou expliquée dans le cadre du hackathon N3XT.
---

# wallet-cli (Agent Stack)

CLI USB de Ledger pour les flux wallet. Réseaux : `bitcoin`, `ethereum`, `solana` (mainnet et testnets).

Source de vérité : `LedgerHQ/agent-skills`, `skills/wallet-cli/wallet-cli-usage/SKILL.md` (commit `8325d5b`, 6 oct. 2026). La doc développeur (`developers.ledger.com/docs/ai-tools/ledger-cli`) en est un résumé.

## Installation

```bash
pnpm add -g @ledgerhq/wallet-cli    # ou npm i -g / yarn global add / bun add -g
wallet-cli --version
wallet-cli genuine-check            # vérifie l'authenticité du device
```

Skill pour un agent de code (v2.1.0+) :

```bash
wallet-cli skill install --agent claude   # aussi : cursor, codex, agents
wallet-cli skill doctor
```

Sans CLI installé : `npx skills add LedgerHQ/agent-skills -s wallet-cli-usage`.

## Règles d'exécution

- **Session d'abord** : `wallet-cli session view` avant toute autre demande vague.
- **Jamais deux commandes device en parallèle** : sinon `[object Object]` ou APDU corrompu. Séquentiel uniquement.
- **Sandbox** : dans Claude Code, les commandes qui ouvrent le device en USB (`account discover`, `receive`, `send`, `genuine-check`, `swap execute`, `earn deposit`, `earn withdraw`, `ring init`) exigent `dangerouslyDisableSandbox: true`. Demander la confirmation avant de relancer avec le bypass.
- **`genuine-check`** échoue (exit 4) si une app devise est ouverte. Revenir au dashboard d'abord.
- **Ticker obligatoire** dans `--amount` (`'0.5 ETH'`). Pas de flag `--token`.
- **Demande ambiguë → demander**, ne jamais deviner (destinataire, réseau, ticker). Une erreur sur un hardware wallet peut coûter des fonds.
- **Adresse de réception différente de l'écran** : ne pas l'utiliser. Déconnecter le device et relancer `genuine-check`.

## Commandes principales

| Besoin | Commande |
|---|---|
| Voir la session | `wallet-cli session view` |
| Réinitialiser la session | `wallet-cli session reset` |
| Découvrir les comptes | `wallet-cli account discover ethereum` (ou `bitcoin`, `solana`, `ethereum:sepolia`) |
| Adresse de réception | `wallet-cli receive ethereum-1` (`--no-verify` pour sauter la confirmation device) |
| Soldes | `wallet-cli balances ethereum-1 --output json` |
| Historique | `wallet-cli operations ethereum-1 --limit 20` |
| Envoyer | `wallet-cli send ethereum-1 --to 0xDEF… --amount '0.5 ETH'` |
| Valider sans signer | `wallet-cli send ethereum-1 --to 0xDEF… --amount '0.5 ETH' --dry-run` |
| Devis swap | `wallet-cli swap quote -f ethereum -t bitcoin --amount 0.1 --from-account ethereum-1 --to-account bitcoin-native-1` |
| Exécuter swap | `wallet-cli swap execute … --provider <id> --amount 0.1` |
| Suivre swap | `wallet-cli swap status --swap-id <id> --provider <id>` |
| Rendements | `wallet-cli earn yields -n ethereum` (lecture seule) |
| Positions | `wallet-cli earn positions solana-1` |
| Staking / vault | `wallet-cli earn deposit <label> --product <id> --amount '<n> <TICKER>'` |
| Métadonnées token | `wallet-cli assets token ethereum 0x…` (sans device) |

Labels de compte : `<network>[-derivation][-env]-<n>` (ex. `ethereum-1`, `bitcoin-native-1`, `ethereum-sepolia-1`). `account discover` doit être lancé avant d'utiliser un label.

## Appel de contrat avec `--data`

Pour les contrats sans commande dédiée. Exemple WETH :

```bash
# wrap 0.5 ETH en WETH
wallet-cli send ethereum-1 --to <WETH_ADDRESS> --amount '0.5 ETH' --data 0xd0e30db0
```

Toujours faire un `--dry-run` d'abord. Le CLI ne vérifie pas la sémantique du calldata : l'écran du device reste le dernier garde-fou.

## Hors périmètre (à dire, ne pas improviser)

- NFT (mint, transfert, affichage).
- Sortie compatible OpenPGP, partage de clé multi-destinataire (utiliser `ring`, qui n'est pas PGP).
- `send`, `receive`, `operations`, `swap execute` sur testnets et L2 (ex. Base).
- Chaînes non listées.

## Erreurs fréquentes

| Erreur | Action |
|---|---|
| `Amount must include a ticker` | Demander à l'utilisateur quel actif, ne pas deviner |
| `Ticker X not found in account` | Lancer `balances`, demander le ticker voulu |
| `Wrong app. Open Ledger dashboard.` (exit 4) | Faire quitter l'app devise, relancer `genuine-check` |
| `Rejected on device` | Ne pas réessayer seul. Demander si l'utilisateur veut réessayer |
| `Timed out talking to the Ledger over USB` | Probablement le sandbox. Demander confirmation avant bypass |
| `Ledger not detected` (exit 3) | Allumer, déverrouiller, brancher en USB |
| `[object Object]` / APDU garbled | Deux commandes device en parallèle. Séquentialiser |

## Points de vigilance pour un projet

- Un `swap execute` DEX (`uniswap`, `oneinch`, `velora`, `okx`) passe par l'app partenaire sur le device. EVM uniquement, RFQ non supporté (fallback sur le pipeline legacy).
- `earn withdraw` Solana est en deux phases (undelegate puis `--finalize` après 2–3 jours).
- `--fee-strategy` : `slow`, `medium` (défaut), `fast`.
- Le rendement affiché n'est pas une garantie. Ne pas présenter un résultat `earn` comme un conseil financier.
