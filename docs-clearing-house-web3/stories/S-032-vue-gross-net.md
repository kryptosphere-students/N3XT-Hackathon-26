---
id: S-032
epic: E-007
title: Vue gross contre net
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **spectateur de la démo**, je veux **voir le volume brut et le volume net côte à côte**, afin de **comprendre l'effet du netting en un coup d'œil**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot, **Quand** la vue s'affiche, **Alors** le montant brut et le montant net apparaissent côte à côte.
- **Étant donné** des chiffres simulés, **Quand** la vue s'affiche, **Alors** la mention « illustratif » est visible (Q-12).

## Subtasks
- [ ] Récupérer les montants bruts et nets depuis le moteur de netting.
- [ ] Afficher les deux montants et leur écart.
- [ ] Ajouter la mention « illustratif » quand les chiffres sont simulés.

## Dépendances
- Bloque : S-035
- Bloqué par : S-015, S-030

## Notes
- Le montant de démonstration vient de l'exemple du spec (100 M€ contre 10 M€). Le marquer comme simulé.
