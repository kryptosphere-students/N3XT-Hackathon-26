# Arborescence du dépôt et du code

## Dépôt

```
N3XT-Hackathon-26/
├── README.md                    Présentation du projet (anglais, lu par le jury)
├── DISCLOSURE.md                Code pré-existant (S-001, exigé par le brief)
├── DECISIONS.md                 Journal des décisions (S-002)
├── DX_FEEDBACK.md               Retours sur les outils Ledger (S-003)
├── LICENSE                      MIT
├── .gitignore
├── clearing-house-web3/         Code du POC (ci-dessous)
├── docs-clearing-house-web3/    Documentation produit, backlog, présentation, guide dev
│   ├── cadrage.md  spec-poc.md  diagramme-technique.md  QUESTIONS.md
│   ├── stories/                 8 epics, 44 stories
│   ├── presentation/            Plan de présentation HTML
│   └── dev/                     Ce guide
```

## Code du POC (cible après S-043)

```
clearing-house-web3/
├── package.json                 Workspaces npm : contracts, packages/*, apps/*
├── package-lock.json            Un seul lock pour tout le monorepo
├── eslint.config.js
├── .env.example                 Placeholders (voir PLACEHOLDERS.md)
├── contracts/                   Foundry
│   ├── foundry.toml  remappings.txt  package.json
│   ├── src/
│   │   ├── ShareToken.sol       S-009  Parts du Fonds F, liste blanche
│   │   ├── MockCash.sol         S-010  Cash de test, 6 décimales
│   │   ├── SettlementEscrow.sol S-011, S-012, S-042  Couverture, settle(lot), deux modes, racine
│   │   └── NavRegistry.sol      S-041  Publication des empreintes de NAV
│   ├── test/                    S-013  Tests unitaires et fuzz (*.t.sol)
│   └── script/Deploy.s.sol      S-014  Déploiement Base Sepolia et anvil
├── packages/
│   └── engine/                  TypeScript pur, sans réseau ni fichier
│       ├── src/
│       │   ├── types.ts         Instruction, Mandate, NetPosition, Lot, NavInputs
│       │   ├── netting.ts       S-015  Soldes nets en bigint
│       │   ├── coverage.ts      S-016  Vérification de couverture
│       │   ├── lot-hash.ts      S-017  Hash keccak256 du lot, parité avec le contrat (D8)
│       │   ├── nav.ts           S-041  Calcul de NAV et empreintes
│       │   └── index.ts
│       └── test/                S-018  Tests unitaires et de propriétés
├── apps/
│   ├── server/                  Fastify, agents, mock NAV
│   │   ├── src/
│   │   │   ├── index.ts         Démarrage du serveur (listen)
│   │   │   ├── app.ts           buildServer, instance Fastify testée avec inject
│   │   │   ├── store.ts         Stockage JSON dans data/store/
│   │   │   ├── signatures.ts    S-019, S-020, S-022  Vérification EIP-191 et EIP-712
│   │   │   ├── routes/
│   │   │   │   ├── mandates.ts      S-019
│   │   │   │   ├── instructions.ts  S-020, S-022, S-026
│   │   │   │   ├── nav.ts           S-024, S-041
│   │   │   │   ├── cycles.ts        S-021, S-042
│   │   │   │   └── scenarios.ts     S-028
│   │   │   ├── agents/
│   │   │   │   ├── llm.ts               S-027  Client Anthropic, outils en liste blanche
│   │   │   │   ├── nav-reconciliation.ts S-025
│   │   │   │   └── instruction-check.ts  S-026
│   │   │   └── chain.ts         Client viem, ABI, publication des empreintes
│   │   └── test/
│   └── web/                     Vite, React, DMK
│       └── src/
│           ├── ledger/
│           │   ├── dmk.tsx      S-005  Provider React du DMK (pas de singleton de module)
│           │   ├── accounts.ts  S-007  Chemins de dérivation en constantes
│           │   ├── sign.ts      S-019, S-020, S-021  signMessage, signTypedData, signTransaction
│           │   └── errors.ts    Refus utilisateur distinct des erreurs (isDeviceRejection)
│           ├── components/
│           │   ├── ConnectLedger.tsx     S-005
│           │   ├── MandateForm.tsx       S-019
│           │   ├── InstructionForm.tsx   S-020
│           │   ├── InstructionsList.tsx  S-031
│           │   ├── GrossNet.tsx          S-032
│           │   ├── Settlement.tsx        S-021, S-033
│           │   └── AttackButton.tsx      S-034
│           └── App.tsx
└── data/
    ├── nav/                     S-024  Fichiers JSON de NAV par fonds et par date (versionnés)
    └── store/                   Données d'exécution (à exclure du dépôt)
```

## Dépendances entre modules

```
contracts ──(ABI dans contracts/out)──► apps/server, apps/web
packages/engine ──(import @chw3/engine)──► apps/server, apps/web
apps/web ──(HTTP)──► apps/server
apps/web ──(WebHID)──► Flex
apps/server, apps/web ──(RPC)──► Base Sepolia ou anvil
```

Le moteur ne dépend de rien d'autre que `viem`. Il peut être développé et testé seul, dès le début.

## Exclus du dépôt

`node_modules/`, `out/`, `cache/`, `clearing-house-web3/data/store/` et `clearing-house-web3/contracts/broadcast/` (`.gitignore` à la racine, complété par S-043).
