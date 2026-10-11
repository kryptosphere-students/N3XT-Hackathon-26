---
name: ledger-architecture-advisor
description: Conseiller d'architecture pour un projet du hackathon N3XT × Ledger — à partir d'une idée, choisir le bon outil Ledger (Agent Stack, Key Ring, Agent Intent, DMK Signer, Clear Signing, Security Key, OpenPGP), dessiner la frontière agent/humain et repérer les pièges. À charger dès qu'un étudiant décrit une idée de projet ou demande « quel outil Ledger utiliser ».
---

# Conseiller d'architecture Ledger

Ce skill ne décide pas à la place de l'équipe. Il pose les questions, propose un outil, puis valide l'architecture contre les règles de `rules/11-ledger-security-rules.md` et `rules/12-agent-human-boundary.md`.

Le brief précise que l'idée n'a pas besoin d'être liée à la finance. Ne pas restreindre le conseil à des wallets.

## Étape 1 : cinq questions

1. **Quelle action doit être prouvée comme approuvée par un humain ?** (transaction, accès, publication, identité, décision)
2. **Quel secret l'agent doit-il utiliser sans jamais le voir ?** (clé API, `.env`, token)
3. **Où tourne le code ?** Navigateur (WebHID, Chromium, HTTPS), Node/CLI, CI/cloud sans USB, mobile.
4. **Quelle chaîne ?** Ethereum/EVM, Bitcoin, Solana, Cosmos, aucune.
5. **Qui a le device en main pendant l'exécution ?** Un humain présent, ou personne.

## Étape 2 : choisir l'outil

| Besoin | Outil | Skill |
|---|---|---|
| Un agent utilise un secret sans le voir, en CI/headless possible après un provisioning | Key Ring (`wallet-cli ring`) | `ledger-key-ring` |
| Un agent propose une action, un humain l'approuve sur son device | Agent Intent (`wallet-cli agent-intent`) | `ledger-agent-intent` |
| Une app web fait confirmer une opération à risque sur device | DMK Signer | `ledger-dmk-signer` |
| Un agent de code doit intégrer le DMK | DMK Skills (`npx skills add`) | `ledger-dmk-signer` |
| Un agent doit exécuter des opérations wallet (solde, envoi, swap, earn) | wallet-cli | `ledger-agent-stack-wallet-cli` |
| Une transaction doit être lisible sur l'écran | Clear Signing (+ `originToken`) | `ledger-clear-signing` |
| Un dApp veut un wallet connectable standard | Wallet Provider | `ledger-clear-signing` |
| Une connexion à un service exige une présence physique | Security Key (FIDO2) | `ledger-hardware-security` |
| Chiffrement compatible GnuPG | OpenPGP | `ledger-hardware-security` |
| Vérifier qu'un device est authentique | `wallet-cli genuine-check` ou `GenuineCheckDeviceAction` | `ledger-agent-stack-wallet-cli` / `ledger-dmk-signer` |

Un projet combine souvent deux outils. Exemple : un agent propose un paiement (Agent Intent) et un service d'accès exige une Security Key (FIDO2) pour publier le résultat.

## Étape 3 : architectures de référence

**A. Agent avec approbation humaine (paiement, action)**

```
Agent ──wallet-cli agent-intent send──► Service Agent Intent ──► lien de revue
                                                                     │
Humain ──────── approuve sur son Ledger ─────────────────────────────┘
```

Frontière : l'agent propose. Humain et device signent.

**B. App web avec signer DMK**

```
Navigateur (Chromium, HTTPS)
  └─ App React ── DMK (WebHID) ── Ledger
       geste utilisateur → getAddress / signTypedData → confirmation sur device
```

Frontière : l'app prépare, le device valide.

**C. Agent headless avec secrets (CI, cloud)**

```
Provisioning (une fois, avec device) : ring init, mot de passe dans le trousseau
Runtime (sans device) : ring decrypt -o /tmp/… ── agent utilise le fichier ── suppression
```

Frontière : l'agent lit le secret, il ne l'expose pas. Pas d'approbation par transaction : le noter comme limite.

## Étape 4 : pièges à signaler

- **WebHID** : Chromium seulement, HTTPS ou localhost, geste utilisateur. Pas de mobile web.
- **Headless** : Key Ring fonctionne sans device après init. Agent Intent `enroll` a besoin d'un trousseau OS. Un conteneur sans Secret Service échoue.
- **Blind signing silencieux** : sans `originToken`, aucune erreur. À dire dans la doc.
- **Secure channel** : genuine check et apps installées exigent internet.
- **Sandbox de Claude Code** : les commandes USB et keychain demandent le bypass, avec confirmation.
- **Device contention** : une seule commande device à la fois.
- **Chemins de dérivation** : constantes, pas de `m/`.
- **Doc partielle** : Clear Signing, Wallet Provider, Security Key, OpenPGP n'ont pas de code dans les pages publiques. Les skills de ce dossier signalent ces zones.

## Étape 5 : valider le design

Avant de coder, vérifier :

- [ ] La frontière agent/humain est écrite (tableau de `rules/12-agent-human-boundary.md`).
- [ ] Une primitive Ledger est **implémentée**, pas seulement citée.
- [ ] Aucun secret n'est saisi ou affiché par l'agent.
- [ ] Le mode de confiance (Clear Signing actif ou non) est explicite.
- [ ] Le projet tourne sans machine spécifique, ou une vidéo est prévue.
- [ ] Le code pré-existant au 7 octobre est déclaré.

## Ce qui n'est pas du conseil

- Pas de conseil financier ou d'investissement. Un projet qui touche des fonds doit rester en testnet ou en dry-run pour la démo.
- Pas de contournement de la confirmation device, ni de bypass de sandbox sans demande explicite.
