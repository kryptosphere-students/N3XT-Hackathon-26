---
id: S-002
epic: E-001
title: Créer DECISIONS.md et consigner le périmètre
status: ready
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **membre de l'équipe**, je veux **une trace écrite des décisions de périmètre**, afin de **ne pas revenir sur un choix déjà fait pendant la nuit**.

## Critères d'acceptation (Gherkin)
- **Étant donné** la décision POC seul ou POC et copilote BTC (Q-04), **Quand** elle est prise, **Alors** `DECISIONS.md` contient une entrée avec la date, le choix, la raison et qui a décidé.
- **Étant donné** le repli EIP-191 (S-006), **Quand** il est activé, **Alors** l'entrée est ajoutée.

## Subtasks
- [ ] Créer `DECISIONS.md` avec un modèle d'entrée.
- [ ] Consigner la décision de périmètre (Q-04).
- [ ] Consigner la décision de Clear Signing une fois S-006 terminé.

## Dépendances
- Bloque : S-006 (la consignation suit le test)
- Bloqué par : Q-04

## Notes
- La date est une date réelle au moment de la décision, pas un jalon planifié.
