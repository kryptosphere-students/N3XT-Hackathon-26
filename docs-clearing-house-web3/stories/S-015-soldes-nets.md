---
id: S-015
epic: E-004
title: Soldes nets en bigint
status: done
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **participant**, je veux **que mon solde net soit calculé exactement**, afin de **ne payer que la différence à régler**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot d'instructions, **Quand** le netting s'exécute, **Alors** un solde net est produit par participant et par fonds.
- **Étant donné** le même lot, **Quand** on calcule deux fois, **Alors** les résultats sont identiques (déterminisme).
- **Étant donné** un montant, **Quand** il est manipulé, **Alors** aucun type flottant n'est utilisé (`bigint` uniquement).

## Subtasks
- [ ] Définir le type d'instruction (participant, fonds, sens, nombre de parts, NAV).
- [ ] Agréger les flux bruts par participant et par fonds en `bigint`.
- [ ] Produire les soldes nets et vérifier leur somme.
- [ ] Écrire des cas de test à la main, avec un exemple de démo (8 flux bruts, 2 nets).

## Dépendances
- Bloque : S-016, S-017, S-032
- Bloqué par : aucune

## Notes
- Le netting n'utilise que des montants déjà validés. La NAV est fournie, jamais calculée par le LLM.
