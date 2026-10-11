---
id: S-014
epic: E-003
title: Déploiement Base Sepolia et vérification
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **jury**, je veux **vérifier les contrats sur l'explorateur**, afin de **confirmer que le code déployé est celui du dépôt**.

## Critères d'acceptation (Gherkin)
- **Étant donné** les contrats déployés, **Quand** on ouvre l'adresse sur l'explorateur Base Sepolia, **Alors** le code source est vérifié.
- **Étant donné** le README, **Quand** on le lit, **Alors** les adresses publiques du token, du cash et de l'escrow figurent.

## Subtasks
- [ ] Créer le wallet déployeur de test et le financer via le faucet Alchemy (voir Q-10).
- [ ] Créer le wallet agent de test pour les frais de gaz, le financer.
- [ ] Lancer `forge script` pour le déploiement.
- [ ] Vérifier les contrats avec une clé API Basescan de test.

## Dépendances
- Bloque : S-021, S-037
- Bloqué par : S-004, S-013

## Notes
- Le faucet Alchemy donne 0,1 ETH par 24 h par adresse. Vérifier les conditions sur la page avant de compter dessus (Q-10).
- Les clés sont des clés de test, jamais de production.
