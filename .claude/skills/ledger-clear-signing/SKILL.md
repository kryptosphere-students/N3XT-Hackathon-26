---
name: ledger-clear-signing
description: Clear Signing Ledger (ERC-7730) et intégration wallet via Ledger Wallet Provider — pourquoi afficher une transaction lisible sur le device, comment activer originToken côté DMK, et quand utiliser le SDK web Wallet Provider. À charger pour une question sur le blind signing, l'affichage des transactions ou l'intégration d'un dApp/wallet.
---

# Clear Signing et Wallet Provider

## Principe

Le Clear Signing traduit les données encodées d'une transaction en champs lisibles (destinataire, montant, token, contrat) affichés sur l'écran du device. Le principe : *what you see is what you sign*. La transaction n'est pas modifiée. Une couche d'affichage est ajoutée et vérifiée sur le device.

Sans Clear Signing (**blind signing**), l'utilisateur voit du hex et signe à l'aveugle. C'est le vecteur classique de phishing et de contrats malveillants.

## Format

- Standard : **ERC-7730**, un jeu de descripteurs publié par le protocole, qui relie fonctions et messages à des champs lisibles.
- Rédaction, schéma, validation : `https://clearsigning.org/build/`.
- Publication : processus de soumission au registre ERC-7730.
- Gouvernance : transférée à la Fondation Ethereum (initiative Trillion Dollar Security) le 12 mai 2026, selon la page Ledger. À vérifier avant de citer.

## Où ça s'affiche

| Contexte | Clear Signing disponible |
|---|---|
| Ledger Wallet via WalletConnect | Toujours |
| Navigateur web3 Ledger Wallet / Ledger Wallet Button | Si le dApp l'a intégré |
| Wallet tiers | Seulement avec accord de Clear Signing avec Ledger |
| Appareils tactiles Ledger | Avec Transaction Check (détection des transactions suspectes) |

## Activer côté DMK (Ethereum)

Le signer ETH fonctionne sans Clear Signing, mais il faut :

1. `@ledgerhq/context-module` installé (obligatoire).
2. Un `originToken` passé au builder. Il s'obtient via le programme partenaire Ledger.

```ts
new SignerEthBuilder({ dmk, sessionId, originToken: "…" }).build();  // Clear Signing
new SignerEthBuilder({ dmk, sessionId }).build();                    // blind signing, silencieux
```

Pour Bitcoin et Solana, pas d'`originToken`. Le Clear Signing dépend de l'app devise.

**Piège** : sans token, aucune erreur runtime. L'écran affiche du hex et l'utilisateur ne le voit qu'en testant. Documenter le mode réel dans le projet.

## Ledger Wallet Provider (SDK web)

Pour intégrer le flux de connexion officiel de Ledger dans une app web. Il gère USB et Bluetooth, et active Clear Signing et Transaction Check automatiquement.

- Paquet : `@ledgerhq/ledger-wallet-provider`, initialisé avec `initializeLedgerProvider`.
- EVM : fournisseur EIP-1193 annoncé via EIP-6963.
- Solana (v2+) : wallet Wallet Standard.
- **Navigateur uniquement, sans SSR** : import dynamique côté client.
- Pas de navigateurs mobiles (WebHID et WebBLE absents sur iOS et Android).

Choix : WebHID direct avec le DMK (`ledger-dmk-signer`) si tu contrôles chaque opération, Wallet Provider si tu veux un wallet connectable standard pour un dApp.

## Limites de la source

La page `developers.ledger.com/docs/clear-signing/overview` ne contient ni exemple de code ni section limites. Les guides d'intégration (« Test Clear Signing for your dApp », « Integrate Clear Signing into your wallet ») sont sur des pages liées, non lues ici.
