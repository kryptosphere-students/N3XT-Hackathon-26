---
name: ledger-agent-intent
description: Faire proposer des actions à un agent autonome, validées par un humain sur son device Ledger (wallet-cli agent-intent — enroll, recover, sync, send). À charger pour un agent qui propose des paiements ou actions à approuver, pour l'enrôlement d'un bot, ou pour la question « qui a approuvé quoi ».
---

# Agent Intent

Un agent logiciel (un bot) reçoit sa propre identité, puis **propose** des transactions. Un humain les approuve sur son Ledger. L'agent ne signe jamais et ne diffuse jamais rien.

C'est la primitive la plus proche du brief : « un agent autonome, une frontière explicite, une approbation matérielle ».

Modèle de confiance **distinct de Key Ring** : l'agent est membre logiciel du Trustchain Agent Intent (App-18), il reçoit l'accès aux comptes Ledger Sync (App-16), et il ne reçoit jamais les clés de domaine de `ring` (App-17). Il n'ouvre pas le device.

## Commandes

```bash
# Crée un profil en attente, affiche l'URL d'enrôlement et l'empreinte, puis BLOQUE jusqu'à approbation
wallet-cli agent-intent enroll --profile my-bot --name "My Bot"
wallet-cli agent-intent enroll --profile my-bot --name "My Bot" --environment staging --expires-in 2h

# Ré-enrôle la clé existante dans son ancien Trustchain (bloque aussi)
wallet-cli agent-intent recover --profile my-bot

wallet-cli agent-intent list
wallet-cli agent-intent show --profile my-bot          # affiche l'empreinte, jamais la clé secrète

# Importe les comptes Ledger Sync accordés à l'agent (explicite, jamais automatique)
wallet-cli agent-intent sync --profile my-bot

# Propose un envoi ETH pour revue humaine. Ne signe rien, ne diffuse rien.
wallet-cli agent-intent send --profile my-bot --account ethereum-1 \
  --to 0xRecipient --amount '0.01 ETH' --description "Invoice #42"

# ERC-20 : passer le contrat, le ticker doit correspondre
wallet-cli agent-intent send --profile my-bot --from 0xSender \
  --to 0xRecipient --amount '25 USDC' --token 0xA0b8…eB48

# Validation locale sans soumettre
wallet-cli agent-intent send --profile my-bot --account ethereum-1 --to 0xRecipient --amount '0.01 ETH' --dry-run
```

Sandbox : `enroll`, `recover`, `sync` et `send` (hors `--dry-run`) exigent le bypass. `list` et `show` non.

## Flux d'enrôlement

1. `enroll` affiche l'URL et l'empreinte, puis attend sur le relais chiffré. **Ne pas tuer le process.**
2. L'humain ouvre le frontend Agent Intent et compare l'empreinte affichée à celle du terminal. Un écart signifie une requête altérée ou envoyée au mauvais agent : stop.
3. Le process se termine avec `enrolled` (JSON : `status: "success"`, `enrolled: true`, `trustchainId`).
4. Expiration par défaut : 30 min (`--expires-in`).

En cas d'échec, Ctrl+C ou timeout, le profil reste `pending` puis `expired` et **ne reprend pas**. Relancer avec un **nouvel** identifiant `--profile`.

## Prérequis

- **Trousseau OS requis** : macOS Keychain, Windows Credential Manager ou Secret Service sous Linux. Pas de fallback fichier, par design. En conteneur ou CI headless, `enroll` échoue sans rien sauvegarder.
- Les statuts (`pending`, `enrolled`, `recovering`, `expired`) sont calculés, pas stockés.

## Envoi : règles

- **Profil enrôlé uniquement.** Environnement défini à l'enrôlement, impossible à changer.
- **Ethereum mainnet uniquement**, y compris en staging (le SDK n'a pas de testnet).
- Adresses : `0x` + 40 hex. Une casse mixte doit passer la checksum EIP-55.
- Montants exacts, jamais arrondis. Plus de décimales que l'actif, zéro ou dépassement uint256 : erreur.
- `--fee-strategy slow|medium|fast` (défaut `medium`) : niveau affiché à l'humain. Le CLI ne vérifie pas le solde. L'humain reste responsable.
- **Ne pas réessayer aveuglément.** Un timeout ou un lien illisible ne veut pas dire que l'intention a échoué. Vérifier le frontend avant de relancer, sinon doublon.

## Pour un projet hackathon

Architecture minimale :

```
Agent (bot, wallet-cli agent-intent send)
   │  propose une intention (signée par la clé du profil)
   ▼
Service Agent Intent  ──► lien de revue
                              │
Humain ── ouvre le lien ──────┘
   │  approuve sur le device Ledger
   ▼
Transaction exécutée par le flux humain (jamais par l'agent)
```

À présenter dans le README : quelles actions passent par `agent-intent send`, et lesquelles restent manuelles.
