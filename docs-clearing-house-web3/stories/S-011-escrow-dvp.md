---
id: S-011
epic: E-003
title: Escrow DvP avec préfinancement
status: backlog
priority: must
estimate: L
owner: équipe
---

## User story
En tant que **participant**, je veux **que la livraison des parts et le paiement du cash soient atomiques**, afin de **ne jamais livrer sans être payé**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot couvert, **Quand** `settle(lot)` est appelée, **Alors** les parts et le cash changent de main dans la même transaction.
- **Étant donné** une couverture insuffisante pour un participant, **Quand** `settle(lot)` est appelée, **Alors** la transaction revert et aucun solde ne change.
- **Étant donné** un participant qui a préfinancé, **Quand** il retire son préfinancement avant règlement, **Alors** le retrait est refusé tant que le lot le concerne.

## Subtasks
- [ ] Définir le stockage du préfinancement par participant et par fonds.
- [ ] Écrire `settle(lot)` avec un seul parcours de transfert, sans transfert partiel.
- [ ] Ajouter le suivi de couverture avant chaque transfert.
- [ ] Écrire les tests de revert et de succès dans Foundry (S-013).

## Dépendances
- Bloque : S-012, S-021
- Bloqué par : S-009, S-010

## Notes
- Respecter le modèle Checks-Effects-Interactions (règle de sécurité OWASP).
- Le lot vient du moteur de netting (E-004). Le contrat ne recalcule rien : il vérifie la racine.
