---
id: S-007
epic: E-002
title: Trois comptes dérivés sur le Flex
status: ready
priority: must
estimate: XS
owner: équipe
---

## User story
En tant que **développeur**, je veux **trois adresses stables pour A, B et C sur un seul Flex**, afin de **signer au nom de chaque participant sans second appareil**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le Flex, **Quand** je dérive les chemins `44'/60'/0'/0/0`, `44'/60'/1'/0/0` et `44'/60'/2'/0/0`, **Alors** trois adresses distinctes sont affichées.
- **Étant donné** un redémarrage de la page, **Quand** je redérive les mêmes chemins, **Alors** les adresses sont identiques.

## Subtasks
- [ ] Dériver les trois adresses avec `getAddress` et `checkOnDevice: true`.
- [ ] Noter les adresses A, B, C dans la configuration (sans clé privée).
- [ ] Mettre les chemins en constantes littérales dans le code, sans saisie utilisateur.

## Dépendances
- Bloque : S-021, S-031
- Bloqué par : S-005

## Notes
- Les chemins suivent la convention Ledger Live : `44'/60'/{account}'/0/0`. Pas de préfixe `m/`.
- Une dérivation fausse produit une adresse valide mais différente, sans erreur. Vérifier contre Ledger Live.
