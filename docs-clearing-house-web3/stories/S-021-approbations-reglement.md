---
id: S-021
epic: E-005
title: Approbations et règlement signés via DMK
status: backlog
priority: must
estimate: L
owner: équipe
---

## User story
En tant que **participant**, je veux **approuver sur mon Flex chaque transaction de règlement qui me concerne**, afin de **garder la main sur chaque mouvement de parts et de cash**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot couvert, **Quand** le règlement est préparé, **Alors** chaque approbation ERC-20 est proposée au compte concerné et s'affiche sur le Flex.
- **Étant donné** un refus sur le Flex, **Quand** la transaction est rejetée, **Alors** le règlement s'arrête sans mouvement et l'échec est affiché comme « refus utilisateur ».
- **Étant donné** un règlement accepté, **Quand** la transaction est confirmée, **Alors** l'événement `SettlementRoot` est observable (S-012).

## Subtasks
- [ ] Préparer les transactions `approve` pour A, B et C.
- [ ] Envoyer chaque transaction via le signer ETH du DMK, avec le chemin du compte concerné.
- [ ] Classer les refus utilisateur (`RefusedByUserDAError`, code 5501 ou 6985) à part.
- [ ] Appeler `settle(lot)` une fois les approbations confirmées.

## Dépendances
- Bloque : S-031, S-033, S-034, S-035
- Bloqué par : S-007, S-011, S-014, S-016, S-020, Q-07

## Notes
- Qui envoie la transaction de règlement est une décision ouverte (Q-07). La recommandation est que l'agent prépare, et qu'un humain signe.
- Clear Signing sur les transferts ERC-20 seulement si S-006 est concluant.
