---
id: S-043
epic: E-001
title: Initialiser le monorepo
status: done
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **développeur**, je veux **un monorepo prêt avec contrats, moteur, serveur et web**, afin que **les deux flux démarrent en parallèle sans régler la configuration chacun de leur côté**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un clone du dépôt, **Quand** on lance `npm install` puis `npm test` dans `clearing-house-web3/`, **Alors** les commandes passent sans erreur.
- **Étant donné** le monorepo, **Quand** on lance `npm run lint`, **Alors** aucun warning n'est remonté.
- **Étant donné** `git status`, **Quand** l'initialisation est terminée, **Alors** aucun `.env`, `node_modules`, `out/` ni `data/store/` n'apparaît.

## Subtasks
- [x] Suivre `docs-clearing-house-web3/dev/SETUP.md`, section 3.
- [x] Ajouter `clearing-house-web3/data/store/` et `clearing-house-web3/contracts/broadcast/` au `.gitignore`.
- [x] Corriger `SETUP.md` si une commande diffère (écarts npm et Foundry notés dans SETUP.md seulement, DX_FEEDBACK.md est réservé aux outils Ledger).
- [x] Vérifier qu'aucun commit automatique n'a été créé (`forge init`, `forge install`).

## Dépendances
- Bloque : S-009, S-015, S-024, S-030
- Bloqué par : aucune

## Notes
- Choix : npm workspaces, stockage en fichiers JSON, TypeScript 6.0.3 (compatibilité `typescript-eslint`).
- Fait le 11 octobre sur Windows 11. Pas de `@openzeppelin/merkle-tree` (D8). `forge-std` en devDependency npm depuis GitHub, pas de `contracts/lib`. Page de test Flex déplacée de `web/` vers `apps/web`, reconnexion et EIP-191 revérifiés après le déplacement.
