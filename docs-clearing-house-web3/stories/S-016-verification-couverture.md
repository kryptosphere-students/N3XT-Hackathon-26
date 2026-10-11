---
id: S-016
epic: E-004
title: Vérification de couverture préfinancée
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **dépositaire**, je veux **qu'un lot soit refusé si un débiteur net n'a pas son préfinancement**, afin de **ne jamais créer de découvert**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un solde débiteur net supérieur au préfinancement, **Quand** la couverture est vérifiée, **Alors** le lot est rejeté avec le participant et le montant manquant.
- **Étant donné** une couverture suffisante, **Quand** la vérification tourne, **Alors** le lot passe à l'étape suivante.

## Subtasks
- [ ] Lire le préfinancement par participant et par fonds.
- [ ] Comparer chaque solde débiteur au préfinancement.
- [ ] Retourner un motif lisible en cas de rejet.

## Dépendances
- Bloque : S-021
- Bloqué par : S-015

## Notes
- Même règle que le contrat : le contrat revert si la couverture manque (S-011). Le double contrôle est voulu.
