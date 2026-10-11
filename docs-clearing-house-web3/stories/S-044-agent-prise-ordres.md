---
id: S-044
epic: E-006
title: Agent de prise d'ordres (email vers instruction en brouillon)
status: backlog
priority: must
estimate: M
owner: Louis
---

## User story
En tant que **gérant**, je veux **envoyer mon ordre comme je le fais aujourd'hui, par email, et le retrouver prêt à signer**, afin de **ne pas ressaisir l'ordre et de ne signer que ce que j'ai vraiment demandé**.

## Pourquoi
Aujourd'hui, une partie des ordres de souscription et de rachat arrive par email, et un back-office les ressaisit à la main. C'est là que l'IA est utile : comprendre un texte libre et en tirer une instruction structurée. C'est aussi ce qui place l'IA au centre du produit, comme le demande le brief.

## Critères d'acceptation (Gherkin)
- **Étant donné** un email « Please subscribe 100 units of Fund F for manager A at today's NAV », **Quand** l'agent le traite, **Alors** il appelle l'outil `draft_instruction` avec fonds, sens, nombre de parts et gérant, et une instruction en brouillon apparaît dans l'interface.
- **Étant donné** un email ambigu (fonds ou quantité manquants), **Quand** l'agent le traite, **Alors** il ne crée rien et explique ce qui manque.
- **Étant donné** une instruction en brouillon, **Quand** elle est affichée, **Alors** l'agent explique en une ou deux phrases ce qu'elle fait, à partir des champs de l'instruction, sans nouveau chiffre.
- **Étant donné** un brouillon, **Quand** le gérant ne l'a pas signé (S-020), **Alors** il n'entre jamais dans un lot.

## Subtasks
- [ ] Outil `draft_instruction` en liste blanche (S-027), validé par un schéma (types et bornes).
- [ ] Trois emails de démo : un clair, un ambigu, un piégé (S-028).
- [ ] Prompt système court : l'agent extrait et explique, il ne calcule pas et ne signe pas.
- [ ] Test : l'email clair donne le bon brouillon, l'email ambigu ne donne rien.

## Dépendances
- Bloque : S-026, S-028, S-031
- Bloqué par : S-027, S-029

## Notes
- Le brouillon passe ensuite par le contrôle de mandat (S-026), puis par la signature humaine (S-020).
