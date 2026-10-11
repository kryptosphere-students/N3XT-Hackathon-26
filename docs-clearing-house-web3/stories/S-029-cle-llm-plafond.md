---
id: S-029
epic: E-006
title: Clé LLM de test et plafond de dépense
status: backlog
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **responsable budget**, je veux **un plafond de dépense sur la clé LLM**, afin de **ne pas dépasser le budget du POC même en cas de boucle**.

## Critères d'acceptation (Gherkin)
- **Étant donné** la clé de test, **Quand** le plafond est atteint, **Alors** la clé est bloquée côté Anthropic.
- **Étant donné** la clé, **Quand** elle est stockée, **Alors** elle figure dans `.env` (jamais dans le dépôt).

## Subtasks
- [ ] Créer une clé de test dans la Console Anthropic.
- [ ] Poser la limite de dépense du workspace (50 $ proposés, alerte à 25 $), à confirmer dans la Console (Q-01).
- [ ] Renseigner `ANTHROPIC_API_KEY` dans `.env` local.

## Dépendances
- Bloque : S-027
- Bloqué par : S-004, Q-01

## Notes
- Tarifs vérifiés le 11 oct. 2026 : `claude-opus-5-5` à 4 $ / 20 $ par MTok, lecture de cache à 0,20 $. Estimation : environ 0,02 $ par appel.
- Si l'équipe choisit `claude-haiku-5-5` (environ 25 fois moins cher), le plafond peut baisser. Décision de l'équipe.
