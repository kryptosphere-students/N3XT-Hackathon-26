---
id: S-041
epic: E-004
title: Publication du hash des entrées et du résultat de NAV
status: done
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **auditeur**, je veux **vérifier que la NAV utilisée pour un cycle est celle qui a été calculée**, afin de **ne pas avoir à faire confiance au serveur qui la calcule**.

## Critères d'acceptation (Gherkin)
- **Étant donné** les entrées de NAV d'un fonds à une date (avoirs, prix de référence), **Quand** le calcul déterministe tourne, **Alors** il produit toujours le même résultat pour les mêmes entrées.
- **Étant donné** un cycle, **Quand** la NAV est publiée, **Alors** le hash des entrées et le hash du résultat sont écrits on-chain dans un événement.
- **Étant donné** une entrée modifiée, **Quand** un auditeur recalcule le hash, **Alors** il diffère de celui publié.

## Subtasks
- [ ] Définir le format canonique des entrées (avoirs, prix, date) et du résultat.
- [ ] Écrire le calcul de NAV déterministe en bigint, sans flottant.
- [ ] Calculer les deux hashes (keccak256 sur encodage ABI).
- [ ] Passer le hash NAV à `settle(lot)`, qui le publie dans `LotSettled` (S-012). Pas d'événement séparé (D8).
- [ ] Tester le recalcul sur deux jeux d'entrées, dont un modifié.

## Dépendances
- Bloque : S-025
- Bloqué par : S-024

## Notes
- Le code garantit l'arithmétique et la traçabilité, pas l'exactitude des prix. Les prix restent une entrée externe (mock pour le POC).
- La NAV reste un acte légal de l'administrateur. Ce n'est pas un calcul on-chain : voir `cadrage.md`, section Proposition de valeur.
- NAV on-chain avec oracle : hors POC, listé dans la suite.
