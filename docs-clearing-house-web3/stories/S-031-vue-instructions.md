---
id: S-031
epic: E-007
title: Vue instructions et statut de signature
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **gérant**, je veux **voir l'état de chacune de mes instructions**, afin de **savoir si elle est signée, rejetée ou en attente**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une instruction, **Quand** elle est affichée, **Alors** son statut est visible : signée sur Ledger, en attente, rejetée (avec motif).
- **Étant donné** un refus utilisateur sur le Flex, **Quand** il est reçu, **Alors** le statut est « refusé sur le boîtier », distinct d'une erreur.

## Subtasks
- [ ] Afficher la liste des instructions (lecture depuis le serveur).
- [ ] Afficher le statut et le motif de rejet.
- [ ] Distinguer les refus utilisateur des erreurs techniques.

## Dépendances
- Bloque : S-034
- Bloqué par : S-020, S-030

## Notes
- Le rendu des `state.output` du DMK ne doit pas être passé directement à React (objet, pas string).
