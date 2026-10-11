---
id: S-022
epic: E-005
title: Refus des instructions et règles non signées
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **gestionnaire du fonds**, je veux **que le serveur refuse toute instruction ou règle sans signature valide**, afin de **qu'aucun ordre non autorisé n'entre dans un lot**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une instruction sans signature, **Quand** elle est soumise, **Alors** le serveur répond 401 et aucune ligne n'est créée dans le lot.
- **Étant donné** une règle non signée, **Quand** le moteur de netting la lit, **Alors** elle est ignorée et un avertissement est journalisé.

## Subtasks
- [ ] Ajouter un middleware de vérification de signature sur les routes d'instruction.
- [ ] Ajouter le filtre de règles signées dans le chargement du mandat.
- [ ] Écrire les tests négatifs (sans signature, signature d'un autre compte, nonce rejoué).

## Dépendances
- Bloque : S-028
- Bloqué par : S-019, S-020

## Notes
- Cette story est au cœur de la démo d'attaque : ne jamais la couper (`stories/README.md`).
