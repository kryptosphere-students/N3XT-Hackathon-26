---
id: S-037
epic: E-008
title: README : frontière, adresses, limites
status: in-progress
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **jury**, je veux **un README qui explique la frontière agent/humain et les limites**, afin de **comprendre le projet sans poser de question**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le README, **Quand** on le lit, **Alors** le tableau agent autonome / humain approuve est présent (règle 12).
- **Étant donné** le README, **Quand** on cherche les adresses, **Alors** les contrats et les adresses A, B, C sont listés.
- **Étant donné** le README, **Quand** on cherche les limites, **Alors** elles figurent : testnet seulement, repli EIP-191 si activé, repli Key Ring si activé, NAV mock.

## Subtasks
- [ ] Écrire la section frontière à partir du modèle de la règle 12.
- [ ] Lister les adresses publiques (S-014).
- [ ] Écrire la section limites et replis activés.
- [ ] Écrire les commandes de lancement.

## Dépendances
- Bloque : S-039
- Bloqué par : S-014, S-021

## Notes
- La frontière est le critère « clarté » du jury (10 %). Écrire avec un tableau, pas en prose.
