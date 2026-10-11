---
id: S-025
epic: E-006
title: Agent de rapprochement NAV
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **opérateur**, je veux **une alerte quand la NAV reçue est périmée ou s'écarte de la référence**, afin de **ne pas régler sur un prix faux**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une NAV périmée, **Quand** le rapprochement tourne, **Alors** une alerte est créée et l'agent l'explique.
- **Étant donné** une NAV conforme, **Quand** le rapprochement tourne, **Alors** aucune alerte n'est créée.
- **Étant donné** l'explication produite par le LLM, **Quand** elle contient un chiffre, **Alors** ce chiffre provient des données fournies en entrée, jamais d'un calcul du LLM.

## Subtasks
- [ ] Écrire l'outil `lire_nav` qui appelle le mock (S-024).
- [ ] Comparer la date et la valeur de façon déterministe.
- [ ] Passer les chiffres au LLM avec l'instruction de ne pas calculer, puis vérifier l'absence de chiffre nouveau.

## Dépendances
- Bloque : S-027
- Bloqué par : S-024

## Notes
- Le contrôle de cohérence (chiffre absent des données) est une vérification code, pas une confiance dans le LLM.
