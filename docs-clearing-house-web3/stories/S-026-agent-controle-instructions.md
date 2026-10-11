---
id: S-026
epic: E-006
title: Contrôle des instructions contre le mandat
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **gestionnaire du fonds**, je veux **que chaque instruction soit contrôlée contre mon mandat**, afin de **bloquer un ordre hors plafond avant qu'il n'atteigne le lot**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une instruction au-dessus du plafond signé, **Quand** le contrôle tourne, **Alors** l'instruction est rejetée avec un motif lisible.
- **Étant donné** une instruction dans le mandat, **Quand** le contrôle tourne, **Alors** elle passe.
- **Étant donné** une règle de mandat non signée, **Quand** le contrôle tourne, **Alors** elle est ignorée (S-022).

## Subtasks
- [ ] Coder les règles de plafond et de fonds autorisés de façon déterministe.
- [ ] Retourner le motif en texte court.
- [ ] Faire expliquer le rejet par le LLM, sans nouveau chiffre.

## Dépendances
- Bloque : S-027, S-028
- Bloqué par : S-020, S-044

## Notes
- Le contrôle est du code, pas du LLM. Le LLM ne fait que l'explication.
- Il s'applique aux brouillons de l'agent de prise d'ordres (S-044) comme aux instructions saisies à la main.
