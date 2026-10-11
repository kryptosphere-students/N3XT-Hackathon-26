---
id: S-020
epic: E-005
title: Signature EIP-712 des instructions, ou repli EIP-191
status: backlog
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **gérant**, je veux **signer chaque souscription ou rachat sur mon Flex**, afin de **valider mon ordre avant qu'il entre dans le lot**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une souscription signée en EIP-712 (si S-006 OK), **Quand** elle est soumise, **Alors** la signature est vérifiée et l'instruction entre dans la file.
- **Étant donné** le repli EIP-191 (S-006 non concluant), **Quand** l'instruction est signée en texte, **Alors** le même comportement s'applique.
- **Étant donné** une signature valide mais hors mandat, **Quand** elle est soumise, **Alors** elle est acceptée comme signée et refusée ensuite par S-026.

## Subtasks
- [ ] Définir le schéma EIP-712 (fonds, sens, nombre de parts, NAV de référence, nonce).
- [ ] Appeler `signTypedData` ou `signMessage` selon le flag de repli.
- [ ] Vérifier la signature côté serveur (`verifyTypedData` ou `verifyMessage`).
- [ ] Ajouter un nonce pour empêcher le rejeu.

## Dépendances
- Bloque : S-021, S-022, S-026, S-031
- Bloqué par : S-006

## Notes
- Le flag de repli est une variable de configuration, pas une branche de code dupliquée.
- Le nonce évite qu'une instruction signée soit rejouée sur un autre cycle.
