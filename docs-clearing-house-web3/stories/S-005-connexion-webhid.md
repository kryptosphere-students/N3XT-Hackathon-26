---
id: S-005
epic: E-002
title: Connexion WebHID au Flex
status: done
priority: must
estimate: S
owner: Mark
---

## User story
En tant que **signataire**, je veux **connecter mon Flex depuis le navigateur**, afin de **valider les opérations sur le boîtier**.

## Critères d'acceptation (Gherkin)
- **Étant donné** Chrome en localhost ou en HTTPS, **Quand** je clique sur « Connecter le Ledger », **Alors** la fenêtre de sélection s'ouvre et le Flex apparaît.
- **Étant donné** le Flex connecté, l'app Ethereum ouverte, **Quand** la page demande l'adresse du compte 1, **Alors** une adresse est affichée et la confirmation sur l'écran du Flex est demandée.
- **Étant donné** un clic absent (appel au chargement de la page), **Quand** la page se charge, **Alors** aucune fenêtre n'apparaît : l'appel doit venir d'un geste utilisateur.

## Subtasks
- [x] Mettre le Flex à jour via Ledger Wallet, puis installer l'app Ethereum.
- [x] Créer une page minimale avec `DeviceManagementKitBuilder` et `webHidTransportFactory`.
- [x] Appeler `startDiscovering` et `connect` depuis un clic.
- [x] Vérifier l'adresse affichée contre celle de l'écran du Flex.

## Résultat (11 oct)
Fonctionne du premier coup dans Chrome sous Windows, Ledger Wallet fermé. Page de test dans `clearing-house-web3/apps/web` (déplacée par S-043). Versions : DMK 1.11.0, transport WebHID 1.2.4, signer ETH 1.18.1.

## Dépendances
- Bloque : S-006, S-007, S-019
- Bloqué par : aucune

## Notes
- Ledger Wallet doit être fermé, sinon Chrome ne voit pas le Flex.
