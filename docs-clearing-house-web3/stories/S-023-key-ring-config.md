---
id: S-023
epic: E-005
title: Configuration et clés agents dans Key Ring
status: done
priority: should
estimate: M
owner: équipe
---

## User story
En tant que **développeur**, je veux **chiffrer la configuration et les clés des agents avec Key Ring**, afin de **ne pas laisser de secret en clair sur le poste**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un ring provisionné (S-008), **Quand** l'agent démarre, **Alors** sa configuration se déchiffre sans afficher le clair.
- **Étant donné** un ring absent, **Quand** l'agent démarre, **Alors** le repli (fichier chiffré local, clé dérivée d'une phrase de passe) est utilisé et la limite est notée.

## Subtasks
- [ ] Chiffrer le `.env` avec `wallet-cli ring encrypt --key clearing-house-config`.
- [ ] Déchiffrer vers un fichier temporaire, jamais vers le terminal.
- [ ] Écrire le repli : AES-GCM avec une clé dérivée d'une phrase de passe, si Key Ring est coupé.

## Dépendances
- Bloque : S-029 (si la clé LLM est chiffrée)
- Bloqué par : S-008

## Notes
- Le mot de passe du ring est fourni par le développeur via le trousseau, jamais par l'agent.
- Le repli est un fichier local, il est signalé comme non final dans le pitch.
