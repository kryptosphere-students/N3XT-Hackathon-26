---
id: S-033
epic: E-007
title: Vue statut de règlement et liens explorateur
status: backlog
priority: should
estimate: S
owner: équipe
---

## User story
En tant que **jury**, je veux **suivre le règlement et ouvrir la transaction sur l'explorateur**, afin de **vérifier moi-même que le règlement a eu lieu**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un règlement confirmé, **Quand** la vue est affichée, **Alors** le statut « réglé » et un lien vers Base Sepolia sont visibles.
- **Étant donné** un règlement en attente, **Quand** la vue est affichée, **Alors** le statut « en attente de confirmation » s'affiche.

## Subtasks
- [ ] Lire le statut de la transaction via viem.
- [ ] Afficher le lien vers l'explorateur.

## Dépendances
- Bloque : aucune
- Bloqué par : S-021, S-030

## Notes
- Première story coupée en cas de retard (`stories/README.md`). Repli : un lien texte dans le README.
