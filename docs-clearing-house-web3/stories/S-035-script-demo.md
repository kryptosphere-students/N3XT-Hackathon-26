---
id: S-035
epic: E-008
title: Script de démo de 3 minutes
status: done
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **présentateur**, je veux **un script de démo pas à pas**, afin de **tenir les 3 minutes sans improviser**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le script, **Quand** il est exécuté deux fois de suite, **Alors** le scénario complet passe sans intervention.
- **Étant donné** le script, **Quand** on le chronomètre, **Alors** la durée est inférieure à 3 minutes.

## Subtasks
- [ ] Écrire les six étapes du parcours de démo (`spec-poc.md`).
- [ ] Préparer les données de démo (adresses A, B, C et la NAV).
- [ ] Chronométrer deux exécutions complètes.

## Dépendances
- Bloque : S-036, S-040
- Bloqué par : S-021, S-028, S-032, S-034

## Notes
- Les étapes : règles signées, instructions signées, contrôle NAV, netting, règlement DvP, attaque refusée.
