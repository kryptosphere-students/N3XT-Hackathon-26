---
id: S-024
epic: E-006
title: Mock serveur NAV
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **agent de rapprochement**, je veux **recevoir une NAV par fonds et par date**, afin de **la comparer aux instructions**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un fichier JSON par fonds et par date, **Quand** le serveur reçoit `GET /nav/:fonds/:date`, **Alors** la valeur est servie.
- **Étant donné** l'option « NAV périmée » activée, **Quand** la requête arrive, **Alors** la date servie est antérieure à la date demandée.
- **Étant donné** l'option « NAV fausse » activée, **Quand** la requête arrive, **Alors** la valeur diffère de la valeur officielle et le champ `source` l'indique.

## Subtasks
- [ ] Écrire un serveur Node minimal.
- [ ] Créer les fichiers JSON du Fonds F pour deux dates.
- [ ] Ajouter les deux options de scénario, activables par variable d'environnement.

## Dépendances
- Bloque : S-025
- Bloqué par : aucune

## Notes
- Le mock remplace l'administrateur du fonds. Aucune NAV réelle (hors périmètre).
