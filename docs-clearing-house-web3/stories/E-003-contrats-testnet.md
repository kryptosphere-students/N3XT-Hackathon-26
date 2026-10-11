---
id: E-003
title: Contrats sur testnet
status: backlog
priority: must
---

## Objectif
Les contrats du POC (token de parts à liste blanche, mock cash, escrow DvP avec préfinancement, racine de Merkle) sont testés avec Foundry, puis déployés et vérifiés sur Base Sepolia.

## Stories
- [ ] S-009 — Token de parts à liste blanche
- [ ] S-010 — Mock cash
- [ ] S-011 — Escrow DvP avec préfinancement
- [ ] S-012 — Racine de Merkle du lot on-chain
- [ ] S-013 — Tests Foundry unitaires et de propriétés
- [ ] S-014 — Déploiement Base Sepolia et vérification
- [ ] S-042 — Mode instantané et mode netting dans le même moteur

## Critères de complétion
- `forge test` est vert, avec le test de somme nulle et le test de revert sans couverture.
- Les adresses publiques figurent dans le README et les contrats sont vérifiés sur l'explorateur.
