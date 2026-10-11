---
id: S-020
epic: E-005
title: Signature EIP-191 des instructions
status: ready
priority: must
estimate: M
owner: Mark
---

## User story
En tant que **gérant**, je veux **signer chaque souscription ou rachat sur mon Flex en lisant l'ordre en clair**, afin de **valider mon ordre avant qu'il entre dans le lot**.

## Critères d'acceptation (Gherkin)
- **Étant donné** une instruction en brouillon (préparée par l'agent S-044 ou saisie à la main), **Quand** je la signe, **Alors** le Flex affiche le texte de l'ordre et la signature est vérifiée par le serveur.
- **Étant donné** une signature valide mais hors mandat, **Quand** elle est soumise, **Alors** elle est acceptée comme signée et refusée ensuite par S-026.
- **Étant donné** une instruction déjà soumise, **Quand** elle est rejouée, **Alors** elle est refusée (nonce).

## Format du texte signé
Court, lisible sur le Flex, nombres en clair. Exemple :

```
Fund F order #12
Subscribe 100 units
Ref NAV 105.00 EUR
Manager A
Nonce 7
```

Le serveur reconstruit ce texte depuis l'instruction et vérifie la signature dessus : une seule fonction `instructionToText()` partagée entre web et serveur.

## Subtasks
- [ ] Écrire `instructionToText()` dans le moteur.
- [ ] Appeler `signMessage` du signer ETH avec le chemin du compte concerné.
- [ ] Vérifier côté serveur avec `verifyMessage` de viem.
- [ ] Ajouter le nonce dans le texte et le contrôler.

## Dépendances
- Bloque : S-021, S-022, S-026, S-031
- Bloqué par : S-006 (fait)

## Notes
- EIP-712 écarté après S-006 : sans descripteur, le Flex exige le blind signing.
