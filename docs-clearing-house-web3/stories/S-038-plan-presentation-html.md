---
id: S-038
epic: E-008
title: Plan de présentation HTML
status: in-progress
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **présentateur**, je veux **un plan de présentation en HTML, avec une partie pour un public non technique et une partie technique**, afin de **préparer le pitch sans rédiger les slides à la main**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le fichier `presentation/plan-presentation.html`, **Quand** on l'ouvre dans un navigateur, **Alors** la présentation se parcourt avec les flèches du clavier, sans dépendance externe.
- **Étant donné** la partie vulgarisation, **Quand** un enfant de cinq ans l'écoute, **Alors** il peut dire à quoi sert un dépositaire central et en quoi le service aide.
- **Étant donné** la partie technique, **Quand** elle est lue, **Alors** elle décrit l'architecture, le flux de démo, la frontière Ledger et ce qui viendra après le hackathon.

## Subtasks
- [x] Rédiger le plan : vulgarisation, technique, suite.
- [ ] Relire la vulgarisation avec une personne extérieure à l'équipe.
- [ ] Vérifier les chiffres (exemple 100 M€ / 10 M€ étiqueté « illustratif », Q-12).
- [ ] Ajouter le lien dans le README (S-037).

## Dépendances
- Bloque : S-040
- Bloqué par : aucune

## Notes
- Le contenu pédagogique s'appuie sur `cadrage.md` et `spec-poc.md`. Aucun chiffre nouveau n'est ajouté.
