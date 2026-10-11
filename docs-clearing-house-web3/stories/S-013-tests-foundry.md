---
id: S-013
epic: E-003
title: Tests Foundry unitaires et de propriétés
status: done
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **développeur**, je veux **des tests qui prouvent les invariants du règlement**, afin de **montrer au jury que le règlement ne peut pas être détourné**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot quelconque, **Quand** les tests de propriétés tournent, **Alors** la somme des soldes nets est nulle.
- **Étant donné** une couverture insuffisante, **Quand** un règlement est tenté, **Alors** le test attend un revert.
- **Étant donné** une liste blanche, **Quand** un transfert vers une adresse non listée est tenté, **Alors** le test attend un revert.

## Subtasks
- [ ] Tests unitaires du token de parts (liste blanche).
- [ ] Tests unitaires de l'escrow (succès et revert).
- [ ] Test de propriété sur la somme nulle (fuzzing Foundry).
- [ ] `forge test` vert, sans warning.

## Dépendances
- Bloque : S-014, S-018
- Bloqué par : S-009, S-011, S-012

## Notes
- Ces tests sont le principal argument de la composante « exécution technique » du jury.
