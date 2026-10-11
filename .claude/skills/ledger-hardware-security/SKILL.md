---
name: ledger-hardware-security
description: Utiliser le Ledger comme clé de sécurité matérielle (FIDO2 / U2F via l'app Security Key) ou pour OpenPGP (chiffrement et déchiffrement avec clés générées sur le device). À charger pour une authentification physique dans un projet, un flux de confirmation humaine basé sur FIDO2, ou une question sur OpenPGP vs Key Ring.
---

# Hardware Security : Security Key et OpenPGP

Deux usages du device hors signature de transaction. Les deux pages source sont courtes et ne contiennent pas de code. Les points marqués « à vérifier » demandent la doc détaillée.

## Security Key (FIDO2 / U2F)

Le Ledger ajoute une validation physique à une connexion : GitHub, npm, 1Password, Discord et autres services compatibles FIDO2.

- App Security Key : supporte FIDO2 et U2F.
- La clé privée du défi est générée sur le device et n'en sort jamais.
- Le service exige le device à chaque connexion.
- La configuration varie selon le service. Référence : article support Ledger 12350325732893, plus la doc du service.

**Implication d'architecture** : un agent peut utiliser une session déjà ouverte, mais **ne peut pas démarrer seul une nouvelle session authentifiée** sur un service protégé. Un humain doit toucher le device. À écrire dans la frontière agent/humain.

Usage hackathon : un déploiement où chaque action sensible à un service (publish npm, merge GitHub) exige une présence physique.

## OpenPGP

Une paire de clés est générée sur le device. Chiffrer contre la clé publique, déchiffrer nécessite le device branché. La clé privée ne quitte jamais le device.

- **Mode strict** : chaque déchiffrement exige une validation manuelle sur le device.
- Public visé : utilisateurs avancés à l'aise avec OpenPGP et GnuPG.
- **Sauvegarde** : une mise à jour de l'app ou du système, ou une réinstallation, efface les clés non sauvegardées. Perdre les clés = perdre l'accès à tout ce qui a été chiffré. Procédure : dépôt `LedgerHQ/app-openpgp`.

### OpenPGP ou Key Ring ?

| Besoin | Outil |
|---|---|
| Secrets personnels, tokens, `.env`, sauvegardes, un agent qui lit des secrets | **Key Ring** (`ledger-key-ring`) |
| Interop avec GnuPG, échange de messages chiffrés avec d'autres | **OpenPGP** |

Ledger recommande Key Ring pour la plupart des usages. Key Ring a besoin du réseau pour chiffrer et déchiffrer, OpenPGP a besoin du device.

## Limites de la source

Les pages Security Key et OpenPGP ne donnent ni prérequis techniques, ni commandes, ni exemples de code, ni procédure WebAuthn. Si un projet doit intégrer WebAuthn ou OpenPGP, lire la doc du service et le dépôt `app-openpgp` avant de coder.
