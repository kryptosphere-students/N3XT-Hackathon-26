# Mémoire systématique des problématiques résolues

Renforce et précise §4.5 et §7 du `CLAUDE.md`. À chaque session où :

- un **bug** a été diagnostiqué (cause racine identifiée),
- un **gotcha** non-évident a été découvert (piège technique, comportement non documenté),
- une **décision technique** a été prise (choix d'archi, choix d'outil, convention),
- une **erreur récurrente** de Claude a été corrigée par l'utilisateur (ex: mauvaise URL d'API, hypothèse fausse),

→ **proposer immédiatement** d'écrire en mémoire **sans attendre la fin de la session**.

## Cibles d'écriture

| Type d'info | Destination |
|---|---|
| Gotcha projet, comportement runtime, flow technique | `~/.claude/projects/<hash>/memory/project_<slug>.md` (section dédiée) |
| Décision d'archi, choix technique structurant | `decisions/log.md` (entrée datée) |
| Préférence utilisateur, règle comportementale | `.claude/rules/NN-<topic>.md` (nouveau fichier) ou `feedback_*.md` dans la mémoire projet |
| Outil ou jargon nouveau | `references/tools.md` ou `references/jargon.md` |

## Format proposition

> « Je propose d'enregistrer en mémoire : [résumé en 1 phrase]. Cible : [chemin]. GO ? »

Ne pas écrire sans GO **explicite**, conformément à §7 du `CLAUDE.md`.

## Anti-pattern

Attendre la fin de la session pour proposer un récap global. Une seule problématique = une seule proposition d'écriture immédiate, dès résolution.

## Exception

Si l'information est déjà couverte en mémoire (vérifier d'abord), proposer une **mise à jour** plutôt qu'une nouvelle entrée.

Source : demande utilisateur 2026-05-22 suite à confusion répétée Stack Auth ↔ Better Auth.
