---
id: S-012
epic: E-003
title: Événement LotSettled (hash du lot, hash NAV, signatures)
status: backlog
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **auditeur**, je veux **retrouver dans la chaîne ce qui a été réglé, sur quelle NAV et avec quelles signatures**, afin de **vérifier la piste d'audit sans faire confiance au serveur**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot réglé, **Quand** la transaction est confirmée, **Alors** un seul événement `LotSettled` contient le hash du lot, le hash NAV (S-041) et les signatures EIP-191 des participants (S-021).
- **Étant donné** le contenu du lot, **Quand** on recalcule son hash hors chaîne (S-017), **Alors** il est égal à celui publié.

## Subtasks
- [ ] Définir l'encodage du lot : liste de (participant, fonds, parts nettes, cash net) encodée en ABI, puis keccak256.
- [ ] Émettre `LotSettled(lotId, lotHash, navHash, signatures)` dans `settle(lot)`.

## Dépendances
- Bloque : S-017
- Bloqué par : S-011

## Notes
- Périmètre réduit le 11 oct (D8) : un hash du lot au lieu d'une racine de Merkle. La racine de Merkle, qui permet de prouver une seule ligne du lot, passe en roadmap.
- L'encodage doit être identique côté TypeScript (S-017).
