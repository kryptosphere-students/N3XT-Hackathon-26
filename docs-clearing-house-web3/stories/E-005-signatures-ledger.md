---
id: E-005
title: Signatures Ledger et garde-fous
status: backlog
priority: must
---

## Objectif
Chaque action qui ajoute du risque est signée sur le Ledger : règles de mandat (EIP-191), instructions (EIP-712 ou repli EIP-191), approbations et règlement DvP. Le serveur rejette tout ce qui n'est pas signé.

## Stories
- [ ] S-019 — Signature EIP-191 des règles de mandat
- [ ] S-020 — Signature EIP-712 des instructions, ou repli EIP-191
- [ ] S-021 — Approbations et règlement signés via DMK
- [ ] S-022 — Refus des instructions et règles non signées
- [ ] S-023 — Configuration et clés agents dans Key Ring

## Critères de complétion
- Une instruction ou une règle sans signature valide n'entre jamais dans un lot.
- Un règlement est exécuté après approbation humaine sur le Flex.
