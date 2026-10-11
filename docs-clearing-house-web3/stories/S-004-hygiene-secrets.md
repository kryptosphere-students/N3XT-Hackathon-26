---
id: S-004
epic: E-001
title: Hygiène des secrets
status: ready
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **membre de l'équipe**, je veux **que les clés de test ne soient jamais versionnées**, afin de **ne pas exposer de secret dans un dépôt public**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le `.gitignore`, **Quand** on exécute `git ls-files`, **Alors** aucun `.env`, aucun fichier `*.key` et aucun fichier de déploiement local n'apparaît.
- **Étant donné** le dépôt, **Quand** on cherche une clé privée (`grep` sur le motif), **Alors** aucun résultat.
- **Étant donné** un `.env.example`, **Quand** un membre clone le dépôt, **Alors** il sait quelles variables renseigner, sans valeur.

## Subtasks
- [ ] Ajouter `.env`, `.env.*`, `*.key` et les dossiers de broadcast Foundry au `.gitignore`.
- [ ] Créer `.env.example` avec les noms de variables, sans valeurs.
- [ ] Lancer un scan de secrets sur l'historique avant la première publication.
- [ ] Documenter dans le README où placer les clés.

## Dépendances
- Bloque : S-014, S-029, S-039
- Bloqué par : aucune

## Notes
- Les clés sont des clés de test, uniquement sur testnet. Aucune clé de production.
