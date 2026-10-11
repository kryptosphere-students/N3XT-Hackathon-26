---
id: S-009
epic: E-003
title: Token de parts à liste blanche
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **gestionnaire du fonds**, je veux **que les parts ne puissent être détenues et transférées qu'entre participants listés**, afin de **respecter la restriction de transfert sans recourir à ERC-3643**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une adresse non listée, **Quand** un transfert de parts lui est adressé, **Alors** la transaction revert.
- **Étant donné** A et B listés, **Quand** le gestionnaire émet 100 parts à A, **Alors** le solde de A est 100 et un événement `Transfer` est émis.
- **Étant donné** la liste blanche, **Quand** un participant est retiré, **Alors** il ne peut plus recevoir de parts.

## Subtasks
- [ ] Écrire un ERC-20 minimal avec contrôle d'accès du gestionnaire.
- [ ] Ajouter la liste blanche et son événement d'ajout et de retrait.
- [ ] Ajouter la vérification de liste blanche dans le hook de transfert.
- [ ] Écrire les tests unitaires (voir S-013).

## Dépendances
- Bloque : S-011, S-013
- Bloqué par : aucune

## Notes
- ERC-3643 est écarté pour le POC (`spec-poc.md`). Ne pas le réintroduire.
- Pas de mécanisme de mise à jour de la liste au-delà des besoins de la démo.
