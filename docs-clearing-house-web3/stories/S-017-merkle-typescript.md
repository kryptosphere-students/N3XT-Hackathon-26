---
id: S-017
epic: E-004
title: Racine de Merkle côté TypeScript
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **auditeur**, je veux **recalculer la racine du lot hors chaîne**, afin de **la comparer à celle publiée sur Base Sepolia**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot identique, **Quand** la racine TypeScript et la racine on-chain sont calculées, **Alors** elles sont égales (test de parité).
- **Étant donné** une feuille modifiée, **Quand** la racine est recalculée, **Alors** elle diffère.

## Subtasks
- [ ] Encoder les feuilles avec `encodeAbiParameters` de viem, mêmes types que le contrat.
- [ ] Construire l'arbre et calculer la racine.
- [ ] Écrire le test de parité avec une racine de référence publiée par S-012.

## Dépendances
- Bloque : S-018, S-037
- Bloqué par : S-012, S-015

## Notes
- Une différence d'encodage fait échouer la parité sans erreur explicite. Tester tôt.
