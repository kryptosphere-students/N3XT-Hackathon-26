---
id: S-018
epic: E-004
title: Tests de propriétés du netting
status: done
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **développeur**, je veux **des tests de propriétés sur des lots aléatoires**, afin de **démontrer que le netting tient quels que soient les flux**.

## Critères d'acceptation (Gherkin)
- **Étant donné** 1 000 lots aléatoires, **Quand** le netting tourne, **Alors** la somme des soldes nets est nulle pour chacun.
- **Étant donné** les mêmes lots, **Quand** la couverture est vérifiée, **Alors** tout lot accepté est couvert.

## Subtasks
- [ ] Générer des lots aléatoires en bigint.
- [ ] Écrire le test de somme nulle.
- [ ] Écrire le test de couverture.

## Dépendances
- Bloque : S-021
- Bloqué par : S-015, S-016, S-017

## Notes
- Mêmes invariants que les tests Foundry (S-013), pour que le jury voie la cohérence.
