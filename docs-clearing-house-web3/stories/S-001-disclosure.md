---
id: S-001
epic: E-001
title: Créer DISCLOSURE.md
status: ready
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **jury**, je veux **lire la déclaration du code pré-existant**, afin de **vérifier que le projet respecte les règles du hackathon**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le dépôt du POC, **Quand** un jury ouvre `DISCLOSURE.md`, **Alors** il trouve la date de début du code et la liste de ce qui est réutilisé d'avant le 7 octobre, ou la mention « aucun ».
- **Étant donné** une dépendance tierce, **Quand** elle est listée, **Alors** sa licence figure à côté.

## Subtasks
- [ ] Créer `DISCLOSURE.md` à la racine du dossier du POC.
- [ ] Vérifier la date du premier commit du copilote BTC (Q-05) et la consigner.
- [ ] Lister les dépendances tierces avec leur licence (DMK Apache-2.0, Key Ring selon Q-11).
- [ ] Lier le fichier depuis le README.

## Dépendances
- Bloque : S-039
- Bloqué par : Q-05

## Notes
- Si le copilote BTC est antérieur au 7 octobre et n'est pas utilisé, le mentionner sans le soumettre.
