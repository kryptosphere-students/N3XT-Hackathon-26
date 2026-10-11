---
id: S-039
epic: E-008
title: Soumission : formulaire, dépôt, post
status: backlog
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **équipe**, je veux **soumettre le projet en une fois, avec les trois éléments obligatoires**, afin d'**être éligible à la revue du jury**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le formulaire, **Quand** il est envoyé, **Alors** une seule soumission existe pour l'équipe (modification via la même réponse).
- **Étant donné** le dépôt, **Quand** le jury l'ouvre, **Alors** il est accessible (Q-13) et la vidéo est liée.
- **Étant donné** le post, **Quand** il est publié depuis le compte du club, **Alors** il contient `#LedgerN3XTCollab` et `@Ledger`.

## Subtasks
- [ ] Vérifier que le dépôt est accessible au jury (Q-13).
- [ ] Vérifier que `DISCLOSURE.md` est à jour (S-001).
- [ ] Remplir le formulaire une seule fois, avec le lien du dépôt et de la vidéo.
- [ ] Publier le post sur X ou LinkedIn depuis le compte du club, avec les deux éléments requis.
- [ ] Envoyer le write-up DX (S-003).

## Dépendances
- Bloque : aucune
- Bloqué par : S-001, S-003, S-036, S-037, Q-13

## Notes
- Le brief demande de ne jamais soumettre deux fois : modifier la réponse existante.
- Ne jamais publier avant que le dépôt soit en état final.
