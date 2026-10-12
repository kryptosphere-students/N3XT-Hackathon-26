---
id: S-021
epic: E-005
title: Approbation du lot en EIP-191, règlement envoyé par le moteur
status: in-progress
priority: must
estimate: L
owner: Mark
---

## User story
En tant que **participant**, je veux **approuver sur mon Flex ce que le lot me fait recevoir et payer**, afin de **garder la main sur chaque mouvement de parts et de cash, sans signer à l'aveugle**.

## Critères d'acceptation (Gherkin)
- **Étant donné** un lot couvert, **Quand** le règlement est préparé, **Alors** chaque participant concerné voit sur son Flex un texte du type « Lot 7, Fund F, you receive 100 units, you pay 10500 USDC, lot hash 0x1a2b... » et le signe.
- **Étant donné** une approbation refusée sur le Flex, **Quand** le refus arrive, **Alors** le règlement s'arrête sans mouvement et l'échec est affiché comme « refus utilisateur ».
- **Étant donné** toutes les approbations reçues et vérifiées, **Quand** le moteur appelle `settle(lot)`, **Alors** l'événement `LotSettled` publie le hash du lot, le hash NAV et les signatures (S-012).
- **Étant donné** une approbation manquante ou invalide, **Quand** le moteur tente le règlement, **Alors** il refuse avant d'envoyer la transaction.

## Pourquoi ce schéma
Le test S-006 montre que le Flex exige le blind signing pour nos propres types EIP-712, et ce serait pareil pour un appel à notre contrat d'escrow ou un `approve` sur nos tokens de test. Les participants ne signent donc que du texte lisible. Les comptes sont préfinancés dans l'escrow au déploiement (S-011), et c'est la clé du moteur qui envoie `settle(lot)` une fois les signatures vérifiées.

Limite à dire dans le pitch : l'escrow fait confiance au moteur pour vérifier les signatures. Elles sont publiées on-chain, donc vérifiables par tous après coup. La vérification dans le contrat est en roadmap.

## Subtasks
- [ ] Écrire `lotApprovalToText(lot, participant)` dans le moteur.
- [ ] Demander la signature de chaque participant concerné via `signMessage`.
- [ ] Vérifier toutes les signatures côté serveur avant tout envoi.
- [ ] Envoyer `settle(lot)` avec la clé du moteur et attendre la confirmation.
- [ ] Classer les refus utilisateur à part.

## Dépendances
- Bloque : S-031, S-033, S-034, S-035
- Bloqué par : S-007, S-011, S-014, S-016, S-020
