---
id: S-042
epic: E-003
title: Mode instantané et mode netting dans le même moteur
status: in-progress
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **participant**, je veux **choisir entre un règlement instantané par ordre et un règlement netté par cycle**, afin de **régler vite quand je veux, ou réduire le cash à mettre de côté**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un ordre seul, **Quand** il est réglé en mode instantané, **Alors** `settle` est appelé avec un lot de taille 1 et le règlement est atomique.
- **Étant donné** un cycle de plusieurs ordres, **Quand** il est réglé en mode netting, **Alors** seuls les soldes nets sont réglés et la racine du lot est publiée.
- **Étant donné** un mode donné pour un cycle, **Quand** un ordre du mauvais mode est soumis, **Alors** il est refusé.

## Subtasks
- [ ] Vérifier que `settle(lot)` accepte un lot de taille 1 sans cas particulier.
- [ ] Ajouter le champ de mode au lot (instantané ou netting), contrôlé à la soumission.
- [ ] Tester les deux modes et le refus de mauvais mode dans Foundry (S-013).
- [ ] Mesurer le délai instruction → règlement pour chaque mode, pour le scénario de référence.

## Dépendances
- Bloque : S-021
- Bloqué par : S-011, S-016

## Notes
- Le mode instantané exige les fonds de l'ordre disponibles à l'exécution. Le mode netting exige la couverture du solde net.
- La mesure de délai alimente la proposition de valeur (`cadrage.md`).
