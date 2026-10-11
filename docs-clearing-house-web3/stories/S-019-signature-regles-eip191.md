---
id: S-019
epic: E-005
title: Signature EIP-191 des règles de mandat
status: in-progress
priority: must
estimate: M
owner: équipe
---

## User story
En tant que **gérant**, je veux **signer mes règles de mandat sur mon Flex**, afin de **prouver que le plafond et les fonds autorisés viennent de moi**.

## Critères d'acceptation (Gherkin)
- **Étant donné** le gérant A, **Quand** il signe ses règles (plafond par cycle, fonds autorisés), **Alors** le serveur vérifie la signature et enregistre les règles.
- **Étant donné** une signature forgée ou d'un autre compte, **Quand** elle est soumise, **Alors** le serveur la rejette.

## Subtasks
- [ ] Définir le texte canonique des règles.
- [ ] Signer via `signMessage` du DMK avec le chemin du compte A.
- [ ] Vérifier côté serveur avec `verifyMessage` de viem.
- [ ] Stocker les règles signées (SQLite ou JSON).

## Dépendances
- Bloque : S-022
- Bloqué par : S-005

## Notes
- Le texte doit être stable : toute modification change le message signé.
