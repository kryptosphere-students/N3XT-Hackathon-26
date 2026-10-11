---
id: S-008
epic: E-002
title: wallet-cli et ring init
status: backlog
priority: should
estimate: M
owner: équipe
---

## User story
En tant que **développeur**, je veux **provisionner Key Ring avec wallet-cli**, afin de **chiffrer la configuration des agents sous une clé liée à ma seed**.

## Critères d'acceptation (Gherkin)
- **Étant donné** wallet-cli installé et l'app Ledger Sync sur le Flex, **Quand** `ring init` est lancé avec `WALLET_PASS` injecté par le trousseau, **Alors** le ring est provisionné.
- **Étant donné** une installation impossible ou une app Ledger Sync absente, **Quand** le test échoue, **Alors** le repli S-023 est activé et la limite est notée.

## Subtasks
- [ ] Installer `@ledgerhq/wallet-cli` (`pnpm add -g`).
- [ ] Lancer `wallet-cli genuine-check` avec le Flex sur le tableau de bord.
- [ ] Vérifier que l'app Ledger Sync s'installe sur le Flex (Q-08).
- [ ] Lancer `ring init` avec sandbox désactivée après confirmation, mot de passe injecté via `$(security find-generic-password …)`.

## Dépendances
- Bloque : S-023
- Bloqué par : S-005, Q-08

## Notes
- wallet-cli ne gère pas les transactions de ce POC (testnet exclu). Son seul rôle ici est Key Ring.
- Ne jamais écrire le mot de passe en clair dans une commande ni le laisser à l'agent.
- Premier point à coupler : si le test dépasse le temps alloué, couper cette story (voir `stories/README.md`).
