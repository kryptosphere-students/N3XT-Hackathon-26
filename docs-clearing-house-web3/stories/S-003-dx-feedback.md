---
id: S-003
epic: E-001
title: Créer DX_FEEDBACK.md
status: ready
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **membre de l'équipe**, je veux **consigner chaque friction rencontrée avec les outils Ledger**, afin de **produire le write-up DX demandé par le brief**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une erreur ou une doc confuse, **Quand** elle est rencontrée, **Alors** une entrée est ajoutée avec la commande, le message d'erreur et la page concernée.
- **Étant donné** la fin du POC, **Quand** le write-up est rédigé, **Alors** il contient les quatre points demandés : doc, workflow, contexte manquant, suggestion.

## Subtasks
- [ ] Créer `DX_FEEDBACK.md` avec un modèle d'entrée.
- [ ] Consigner les frictions de S-005 (WebHID, Chrome).
- [ ] Consigner les frictions de S-006 (Clear Signing).
- [ ] Consigner les frictions de S-008 (wallet-cli, sandbox).

## Dépendances
- Bloque : S-039
- Bloqué par : aucune

## Notes
- Le brief dit que les équipes doivent être directes. Ne pas polir les entrées.
