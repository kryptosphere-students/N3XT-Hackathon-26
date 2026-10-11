---
id: S-030
epic: E-007
title: Squelette Vite, React et viem
status: backlog
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **développeur**, je veux **un squelette web qui tourne en localhost**, afin de **brancher le DMK et les instructions sans perdre de temps sur la configuration**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le squelette, **Quand** `npm run dev` est lancé, **Alors** la page s'affiche en localhost.
- **Étant donné** la page, **Quand** elle se charge, **Alors** aucun appel WebHID n'est tenté (il doit venir d'un clic).

## Subtasks
- [ ] Partir d'un template Vite React TypeScript.
- [ ] Ajouter viem et le DMK.
- [ ] Configurer HTTPS local si le navigateur le requiert.

## Dépendances
- Bloque : S-031, S-032, S-034
- Bloqué par : aucune

## Notes
- Partir d'un template existant (`spec-poc.md`, Autres composants).
