# Plan de développement

Horizon : 48 h, sans dates. Ordre et dépendances viennent du backlog (`../stories/board.md`). Hypothèse : deux développeurs en parallèle, plus les membres qui pitchent (Q-15). Avec un seul développeur, suivre le flux A puis le flux B et couper les stories `should`.

## 1. Deux flux en parallèle

| Flux | Responsable | Périmètre | Stories |
|---|---|---|---|
| **A : chaîne et moteur** | Dev 1 | Monorepo, contrats, moteur, déploiement | S-043, S-009 à S-014, S-042, S-015 à S-018, S-041 |
| **B : Ledger et interface** | Dev 2 | Flex, signatures, web, vérification serveur | S-005 à S-008, S-030, S-019, S-020, S-022, S-031 à S-034, S-021 |
| **Commun** | Premier libre | Serveur, agents, LLM | S-024 à S-029, S-023 |
| **Équipe pitch** | Non-développeurs | Gouvernance, démo, soumission | S-001 à S-003, S-035 à S-040, actions manuelles |

## 2. Jalons

| Jalon | Contenu | Sortie vérifiable |
|---|---|---|
| **M0 : prêt** | S-043 (monorepo), S-005 (WebHID), S-006 (Clear Signing tranché), S-007 (adresses A, B, C) | `npm test` vert sur un dépôt vide, Flex connecté, décision EIP-712 ou EIP-191 consignée |
| **M1 : chaîne sans Ledger** | Contrats et moteur sur `anvil` | Un lot JSON réglé en local dans les deux modes, racines identiques |
| **M2 : signatures branchées** | S-019, S-020, S-022 | Règles et instructions signées sur le Flex, acceptées par le serveur, refus testés |
| **M3 : règlement sur Base Sepolia** | S-014, S-021, S-042 | Un règlement de chaque mode confirmé sur l'explorateur, délais mesurés |
| **M4 : démo jouable** | Agents, NAV, attaque, interface | Script de démo (S-035) déroulé une fois en entier |
| **M5 : gel** | Vidéo, README, soumission | Vidéo enregistrée, README complet, soumission envoyée |

Le gel se déclenche à M4. Après le gel, seules les corrections de bugs de la démo sont acceptées.

## 3. Ordre de travail par flux

**Flux A**

1. S-043 Initialiser le monorepo (débloque tout le monde).
2. S-015, S-016 Moteur : soldes nets et couverture. Aucun prérequis, à lancer tôt.
3. S-009, S-010 Token de parts et mock cash.
4. S-011, S-042 Escrow et deux modes.
5. S-012, S-017 Racine de Merkle, puis test de parité.
6. S-013, S-018 Tests de propriétés côté contrats et moteur.
7. S-041 Empreintes de NAV.
8. S-014 Déploiement sur Base Sepolia, adresses dans le `.env` et le README.

**Flux B**

1. S-005, S-006 Connexion et test Clear Signing : en tout premier, ce test décide du format des instructions.
2. S-007 Adresses A, B, C.
3. S-030 Squelette web (si S-043 est fini, sinon dans `apps/web` seul).
4. S-019, S-020 Signatures des règles et des instructions, côté web et serveur.
5. S-022 Refus des signatures invalides.
6. S-031, S-032 Vues instructions et gross contre net.
7. S-021 Approbations et règlement (attend S-014 du flux A).
8. S-034, S-033 Bouton d'attaque, statut de règlement.

**Commun**

1. S-024 Mock NAV, puis S-025, S-026 Agents de contrôle.
2. S-029 Clé LLM, puis S-027 Outils en liste blanche.
3. S-028 Scénario d'injection.
4. S-008, S-023 Key Ring, si le temps le permet.

## 4. Points d'intégration

| Point | Entre | Ce qui doit être figé |
|---|---|---|
| ABI des contrats | Flux A et flux B | Signatures de `settle`, `deposit`, événements (API-CONNECTEURS.md, section 3) |
| Types du moteur | Flux A et serveur | `Instruction`, `Lot`, `NetPosition` dans `@chw3/engine` |
| Domaine et type EIP-712 | Web et serveur | PLACEHOLDERS.md, section 2 |
| Routes du serveur | Web et serveur | API-CONNECTEURS.md, section 3 |
| Format des feuilles de Merkle | Contrat et moteur | PLACEHOLDERS.md, section 2 |

Figer ces points en début de M1. Toute modification ensuite se discute entre les deux flux.

## 5. Conventions

- Une branche par story : `feat/S-011-escrow`, `fix/S-022-nonce`.
- Conventional Commits avec l'identifiant de la story : `feat(contracts): settle lot atomically (S-011)`.
- Petites PR, relues par l'autre flux quand elles touchent un point d'intégration.
- Mettre à jour le statut de la story (`status:` dans la fiche, et `board.md`) en même temps que la PR.
- Claude Code ne commite pas et ne pousse pas : les commits sont faits par l'équipe.

## 6. Si le temps manque

Suivre l'ordre de coupe de `../stories/README.md`. Ne jamais couper S-006, S-022, S-028, S-036 ni S-039.
