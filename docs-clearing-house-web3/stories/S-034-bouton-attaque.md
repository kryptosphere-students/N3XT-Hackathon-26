---
id: S-034
epic: E-007
title: Bouton scénario d'attaque
status: backlog
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **présentateur**, je veux **un bouton qui rejoue l'attaque**, afin de **la montrer en direct sans manipulation risquée**.

## Critères d'acceptation (Gherkin)
- **Étant donné** la page, **Quand** je clique sur « Scénario d'attaque », **Alors** la dépêche de S-028 est jouée.
- **Étant donné** le scénario joué, **Quand** il se termine, **Alors** le refus et son motif sont affichés, et aucune demande de signature n'apparaît sur le Flex.

## Subtasks
- [ ] Ajouter le bouton, relié au scénario de S-028.
- [ ] Afficher le déroulé pas à pas (dépêche, appel refusé, motif).

## Dépendances
- Bloque : S-035
- Bloqué par : S-028, S-031

## Notes
- Ne jamais couper cette story (`stories/README.md`).
