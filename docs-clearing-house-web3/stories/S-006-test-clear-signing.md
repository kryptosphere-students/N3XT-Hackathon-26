---
id: S-006
epic: E-002
title: Test Clear Signing EIP-712 sur Flex
status: done
priority: must
estimate: S
owner: Mark
---

## User story
En tant que **gérant**, je veux **voir sur mon Flex les champs d'une instruction de souscription**, afin de **savoir exactement ce que je signe**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un message EIP-712 minimal (Fonds F, souscription de 100 parts), **Quand** il est signé via le DMK, **Alors** l'écran du Flex affiche les champs lisibles et le test est marqué « Clear Signing OK ».
- **Étant donné** un écran qui affiche du hex brut ou un refus, **Quand** le test est évalué, **Alors** le test est marqué « EIP-191 retenu » et la décision est consignée (S-002).

## Résultat (11 oct) : EIP-191 retenu
- **EIP-191** (`signMessage`, texte de 4 lignes) : lisible sur le Flex, retours à la ligne compris.
- **EIP-712** (`signTypedData`, nos propres types, sans descripteur) : d'abord un écran d'activation de Transaction Check, puis « This transaction cannot be clear-signed, enable blind signing ». Refusé. Erreur renvoyée : `6a80 Invalid data`.
- Conséquence : toute signature humaine passe en EIP-191. Pas d'appel à nos propres contrats depuis le Flex, ils seraient aussi en blind signing (D6 dans `DECISIONS.md`).
- Détails et versions : `web/README.md`. Friction consignée dans `DX_FEEDBACK.md`.

## Dépendances
- Bloque : S-020, S-021
- Bloqué par : S-005

## Notes
- Ne jamais activer le blind signing, même pour tester.
- Ne jamais mapper `eth_sign` : utiliser `signMessage`.
