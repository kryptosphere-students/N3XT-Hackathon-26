---
id: S-005
epic: E-002
title: Connexion WebHID au Flex
status: ready
priority: must
estimate: S
owner: équipe
---

## User story
En tant que **signataire**, je veux **connecter mon Flex depuis le navigateur**, afin de **valider les opérations sur le boîtier**.

## Critères d'acceptation (Gherkin)
- **Étant donné** Chrome en localhost ou en HTTPS, **Quand** je clique sur « Connecter le Ledger », **Alors** la fenêtre de sélection s'ouvre et le Flex apparaît.
- **Étant donné** le Flex connecté, l'app Ethereum ouverte, **Quand** la page demande l'adresse du compte 1, **Alors** une adresse est affichée et la confirmation sur l'écran du Flex est demandée.
- **Étant donné** un clic absent (appel au chargement de la page), **Quand** la page se charge, **Alors** aucune fenêtre n'apparaît : l'appel doit venir d'un geste utilisateur.

## Subtasks
- [ ] Mettre le Flex à jour via Ledger Live, puis installer l'app Ethereum.
- [ ] Créer une page minimale avec `DeviceManagementKitBuilder` et `webHidTransportFactory`.
- [ ] Appeler `startDiscovering` et `connect` depuis un clic.
- [ ] Vérifier l'adresse affichée contre celle de Ledger Live.

## Dépendances
- Bloque : S-006, S-007, S-019
- Bloqué par : aucune

## Notes
- Le Flex est le seul appareil prévu (Q-06). Le DMK escalade s'il en détecte plusieurs.
- Consigner toute friction dans `DX_FEEDBACK.md` (S-003).
