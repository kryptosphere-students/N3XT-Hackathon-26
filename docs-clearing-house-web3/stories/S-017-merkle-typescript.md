---
id: S-017
epic: E-004
title: Hash du lot côté TypeScript (parité avec le contrat)
status: done
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **auditeur**, je veux **recalculer le hash du lot hors chaîne**, afin de **le comparer à celui publié sur Base Sepolia**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot identique, **Quand** le hash TypeScript et le hash on-chain sont calculés, **Alors** ils sont égaux (test de parité).
- **Étant donné** une ligne modifiée, **Quand** le hash est recalculé, **Alors** il diffère.

## Subtasks
- [ ] Encoder le lot avec `encodeAbiParameters` de viem, mêmes types que le contrat, puis `keccak256`.
- [ ] Écrire le test de parité avec un hash de référence produit par le test Foundry (S-012).

## Dépendances
- Bloque : S-018, S-037
- Bloqué par : S-012, S-015

## Notes
- Remplace la racine de Merkle (D8). Une différence d'encodage fait échouer la parité sans erreur explicite : tester tôt.
