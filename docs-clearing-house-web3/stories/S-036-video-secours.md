---
id: S-036
epic: E-008
title: Vidéo de secours
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **présentateur**, je veux **une vidéo du scénario complet**, afin de **montrer le POC même si la démo en direct échoue**.

## Critères d'acceptation (Gherkin)
- **Étant donné** la démo, **Quand** la vidéo est enregistrée, **Alors** elle dure environ 3 minutes et montre les six étapes.
- **Étant donné** la vidéo, **Quand** elle est liée dans le README, **Alors** elle est lisible sans compte.

## Subtasks
- [ ] Enregistrer le scénario complet une fois le script validé.
- [ ] Ajouter une voix off ou des sous-titres sur les étapes Ledger.
- [ ] Héberger la vidéo et la lier depuis le README et le formulaire.

## Dépendances
- Bloque : S-039
- Bloqué par : S-035

## Notes
- Ne jamais couper (`stories/README.md`). Le brief demande une vidéo de démo courte.
