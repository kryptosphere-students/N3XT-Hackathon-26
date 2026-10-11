---
id: S-027
epic: E-006
title: Outils LLM en liste blanche
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **responsable sécurité**, je veux **que le LLM n'appelle que des outils déclarés**, afin de **limiter ce qu'une instruction injectée peut déclencher**.

## Critères d'acceptation (Gherkin)
- **Étant donné** la liste d'outils (lecture NAV, lecture des positions, création d'instruction en brouillon), **Quand** le LLM demande un outil hors liste, **Alors** l'appel est refusé et journalisé.
- **Étant donné** la création d'instruction, **Quand** le LLM l'appelle, **Alors** l'instruction est créée en brouillon, non signée, et ne peut pas être soumise sans signature humaine.
- **Étant donné** une demande d'explication, **Quand** le LLM répond, **Alors** il ne produit aucune transaction.

## Subtasks
- [ ] Déclarer les trois outils avec des schémas stricts (`strict: true`).
- [ ] Écrire la boucle d'appels : `claude-opus-5-5`, via le SDK TypeScript d'Anthropic.
- [ ] Vérifier la liste blanche à chaque appel, avant exécution.
- [ ] Activer le repli serveur des refus : `fallbacks: "default"` avec l'en-tête `server-side-fallback-2026-07-01`, vérifié dans la doc live avant d'écrire le code.
- [ ] Gérer `stop_reason: "refusal"` avant de lire le contenu.

## Dépendances
- Bloque : S-028
- Bloqué par : S-025, S-026, S-029

## Notes
- Le skill `claude-api` recommande `fallbacks` par défaut sur `claude-opus-5-5`. Confirmer la syntaxe dans la doc live (`shared/live-sources.md`).
- Ne jamais forcer `tool_choice` (`any` ou `tool`) : renvoie une erreur 400 sur ce modèle.
