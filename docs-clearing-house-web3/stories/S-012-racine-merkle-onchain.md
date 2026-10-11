---
id: S-012
epic: E-003
title: Racine de Merkle du lot on-chain
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **auditeur**, je veux **retrouver la racine du lot compensé dans la chaîne**, afin de **vérifier la piste d'audit sans faire confiance au serveur**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot réglé, **Quand** la transaction est confirmée, **Alors** un événement contient la racine de Merkle du lot.
- **Étant donné** une feuille du lot, **Quand** on fournit sa preuve, **Alors** la vérification réussit contre la racine on-chain.

## Subtasks
- [ ] Définir l'encodage de la feuille : participant, fonds, solde net en uint256.
- [ ] Vérifier la preuve dans le contrat ou la documenter comme vérification hors chaîne.
- [ ] Émettre un événement `SettlementRoot`.

## Dépendances
- Bloque : S-017
- Bloqué par : S-011

## Notes
- L'encodage doit être identique côté TypeScript (S-017), sinon la parité échoue.
