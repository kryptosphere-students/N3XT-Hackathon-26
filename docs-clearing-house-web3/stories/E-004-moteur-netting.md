---
id: E-004
title: Moteur de netting
status: backlog
priority: must
---

## Objectif
Un code déterministe, sans LLM ni nombre flottant, calcule les soldes nets par participant et par fonds, vérifie la couverture préfinancée et produit une racine de Merkle identique à celle du contrat.

## Stories
- [ ] S-015 — Soldes nets en bigint
- [ ] S-016 — Vérification de couverture
- [ ] S-017 — Racine de Merkle côté TypeScript
- [ ] S-018 — Tests de propriétés du netting
- [ ] S-041 — Publication du hash des entrées et du résultat de NAV

## Critères de complétion
- Pour un lot donné, la somme des soldes nets est nulle.
- La racine TypeScript est égale à la racine on-chain (test de parité).
