---
id: S-006
epic: E-002
title: Test Clear Signing EIP-712 sur Flex
status: ready
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **gérant**, je veux **voir sur mon Flex les champs d'une instruction de souscription**, afin de **savoir exactement ce que je signe**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un message EIP-712 minimal (Fonds F, souscription de 10 parts, NAV de référence), **Quand** il est signé via le DMK, **Alors** l'écran du Flex affiche les champs lisibles et le test est marqué « Clear Signing OK ».
- **Étant donné** un écran qui affiche du hex brut ou un refus, **Quand** le test est évalué, **Alors** le test est marqué « EIP-191 retenu » et la décision est consignée (S-002).

## Subtasks
- [ ] Écrire le typedData minimal (domaine, types, message).
- [ ] Appeler `signTypedData` du signer ETH avec le chemin du compte A.
- [ ] Photographier l'écran du Flex et noter le rendu.
- [ ] Consigner le résultat dans `DECISIONS.md` (S-002) et dans `DX_FEEDBACK.md` (S-003).

## Dépendances
- Bloque : S-020, S-002
- Bloqué par : S-005, Q-02 (originToken)

## Notes
- Décision la plus importante du POC. À faire en premier lors de l'ordre d'exécution.
- Sans `originToken`, le rendu peut être du hex brut. Le repli EIP-191 est prévu (`spec-poc.md`, Replis).
- Ne jamais mapper `eth_sign` : utiliser `signTypedData` ou `signMessage`.
