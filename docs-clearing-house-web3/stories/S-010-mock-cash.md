---
id: S-010
epic: E-003
title: Mock cash
status: backlog
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **dépositaire C**, je veux **disposer de cash de test**, afin de **préfinancer le règlement sans monnaie réelle**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le contrat de cash, **Quand** le déployeur mint 1 000 000 unités à C, **Alors** le solde de C est 1 000 000.
- **Étant donné** A et B, **Quand** le script de distribution s'exécute, **Alors** chacun reçoit une provision de test.

## Subtasks
- [ ] Écrire un ERC-20 de test (six décimales, pour lisibilité du rendu).
- [ ] Écrire le script de mint et de distribution.

## Dépendances
- Bloque : S-011, S-014
- Bloqué par : aucune

## Notes
- Le cash est un mock, aucun lien avec une monnaie tokenisée réelle.
