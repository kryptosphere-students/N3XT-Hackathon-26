---
id: E-006
title: Agents, NAV et LLM
status: backlog
priority: must
---

## Objectif
Les agents contrôlent la NAV et les instructions, expliquent les écarts sans rien calculer, n'utilisent que des outils en liste blanche, et résistent à une dépêche malveillante. Le LLM est `claude-opus-5-5` (Q-01).

## Stories
- [ ] S-024 — Mock serveur NAV
- [ ] S-025 — Agent de rapprochement NAV
- [ ] S-026 — Agent de contrôle des instructions
- [ ] S-027 — Outils LLM en liste blanche
- [ ] S-028 — Scénario d'injection bloqué
- [ ] S-029 — Clé LLM de test et plafond de dépense

## Critères de complétion
- Le LLM ne produit aucun chiffre et aucune transaction.
- La dépêche malveillante ne crée aucune instruction et ne sollicite pas le Ledger.
