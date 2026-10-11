---
id: E-002
title: Validation Ledger en amont
status: ready
priority: must
---

## Objectif
Lever les risques matériels avant d'écrire la logique : connexion WebHID au Flex, comptes dérivés, Clear Signing EIP-712 (décisif), wallet-cli et Ring CLI. Cette epic bloque la signature des instructions.

## Stories
- [ ] S-005 — Connexion WebHID au Flex
- [ ] S-006 — Test Clear Signing EIP-712 sur Flex
- [ ] S-007 — Trois comptes dérivés sur le Flex
- [ ] S-008 — wallet-cli et ring init

## Critères de complétion
- Le Flex répond à une demande d'adresse depuis Chrome.
- Le test Clear Signing a un résultat consigné (lisible ou repli EIP-191).
- Les trois adresses A, B, C sont notées et stables.
