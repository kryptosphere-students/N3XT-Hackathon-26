---
name: ledger-dmk-signer
description: Intégrer un Ledger Signer dans une app web ou Node avec le Device Management Kit (DMK TypeScript) — init, découverte, session, signer Ethereum/Bitcoin/Solana, états observables, classification des erreurs, et DMK Skills pour un agent de code. À charger pour tout code qui appelle un device Ledger pour signer ou obtenir une adresse.
---

# Ledger DMK Signer

Pour la confirmation humaine d'opérations à risque depuis une app : chaque signature s'affiche et se valide sur le device.

Source : `device-sdk-ts` (npm `@ledgerhq/device-management-kit`), sample app `apps/sample`, et `LedgerHQ/agent-skills/skills/dmk/` (commit `8325d5b`). Pour les signatures exactes, vérifier les types npm de la version installée : la doc web et les skills peuvent diverger.

## Architecture

```
Ton app
  └─ Signer kit (SignerEth / SignerBtc / SignerSolana / …)
       └─ Device Management Kit (DMK) — un seul par application
            └─ Transport (WebHID / WebBLE / NodeHID / RN / Speculos)
                 └─ Device Ledger (Nano S+, Nano X, Stax, Flex)
```

## Paquets

```bash
npm install @ledgerhq/device-management-kit rxjs
npm install @ledgerhq/device-transport-kit-web-hid     # navigateur ; Node : node-hid
npm install @ledgerhq/device-signer-kit-ethereum @ledgerhq/context-module
```

`@ledgerhq/context-module` est une dépendance pair obligatoire du signer Ethereum. Sans lui : `Module not found: Can't resolve '@ledgerhq/context-module'`.

Autres signers : `device-signer-kit-bitcoin`, `-solana`, `-cosmos`, `-hyperliquid`, `-aleo`, `-zcash`.

Versions connues fonctionnelles (au moment du fetch) : DMK `1.2.0`, web-hid `1.2.3`, signer ETH `1.12.0`, BTC `1.3.0`, SOL `1.7.1`. À revérifier avec `npm view`.

## Contraintes de plateforme

- **WebHID et WebBLE : Chromium uniquement** (Chrome, Edge, Brave). Ni Firefox ni Safari.
- **HTTPS ou localhost** obligatoire.
- **`startDiscovering()` et `connect()` sur un geste utilisateur** (clic). Sinon échec silencieux.
- Opérations secure channel (genuine check, liste/installation d'apps) : **internet requis**, et `AllowSecureConnection` à valider sur le device une fois par reboot.
- Node/CLI : `node-hid`, et `listenToAvailableDevices` (pas de picker navigateur).
- Pas de mobile web (pas de WebHID ni WebBLE sur iOS/Android).

## Initialisation

```ts
// Navigateur, hors React : singleton
import { DeviceManagementKitBuilder } from "@ledgerhq/device-management-kit";
import { webHidTransportFactory, webHidIdentifier } from "@ledgerhq/device-transport-kit-web-hid";

export const dmk = new DeviceManagementKitBuilder()
  .addTransport(webHidTransportFactory)
  .build();
```

En React : **pas de singleton module-level**. Utiliser le Provider de contexte (sinon deux instances DMK).

En Node : une seule instance par process (chaque transport ajoute des listeners USB).

## Découverte et connexion (navigateur, sur clic)

```ts
import { firstValueFrom } from "rxjs";
import { webHidIdentifier } from "@ledgerhq/device-transport-kit-web-hid";

async function connectDevice(): Promise<string> {
  const device = await firstValueFrom(dmk.startDiscovering({ transport: webHidIdentifier }));
  return dmk.connect({ device });   // sessionId
}
```

Toujours importer `webHidIdentifier` plutôt que la chaîne `"WEB-HID"`.

Déconnexion : `await dmk.disconnect({ sessionId })`. Ne pas se déconnecter entre deux opérations : la session est un handle de transport, pas une autorisation.

## Signer Ethereum

```ts
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";

const signerEth = new SignerEthBuilder({
  dmk,
  sessionId,
  originToken: process.env.LEDGER_ORIGIN_TOKEN, // sans token : hex brut sur l'écran (blind signing silencieux)
}).build();

const path = "44'/60'/0'/0/0";   // constante littérale, pas de "m/"

// Adresse à afficher à l'utilisateur : checkOnDevice obligatoire
const { observable } = signerEth.getAddress(path, { checkOnDevice: true });

// Transaction : Uint8Array RLP-encodé
const { observable: tx } = signerEth.signTransaction(path, txBytes);

// Message : personal_sign, préfixé (ne jamais mapper eth_sign)
const { observable: msg } = signerEth.signMessage(path, "Hello");

// EIP-712 : domain + types + message obligatoires
const { observable: td } = signerEth.signTypedData(path, typedData);
```

Sorties : `getAddress` → `output.address`, `output.publicKey`. Signatures → `output.r`, `output.s`, `output.v`.

Bitcoin : `signPsbt()` pour un PSBT brut, `getWalletAddress()` avec `checkOnDevice: true` pour un receive. Solana : `signTransaction(path, messageBytes)`, sortie `output.signature`.

## Observables : états à gérer

Chaque méthode renvoie `{ observable, cancel }`.

| Statut | Interaction | Action |
|---|---|---|
| `NotStarted` | — | Attendre |
| `Pending` | `UnlockDevice` | Demander le PIN. Ne pas boucler |
| `Pending` | `ConfirmOpenApp` | Attendre la confirmation (30 s) |
| `Pending` | `SignTransaction` / `SignTypedData` / `SignPersonalMessage` / `VerifyAddress` | Afficher « valider sur le Ledger » (60 s) |
| `Completed` | — | Extraire `state.output` |
| `Stopped` | — | Annulé |
| `Error` | — | Classifier (voir ci-dessous) |

**Ne jamais rendre `state.output` directement en React** : objet, pas string.

## Rejet utilisateur ≠ erreur

```ts
function isDeviceRejection(error: unknown): boolean {
  const tag = (error as any)?._tag ?? "";
  const code = (error as any)?.errorCode ?? (error as any)?.originalError?.errorCode ?? "";
  return tag === "RefusedByUserDAError" || code === "5501" || code === "6985" || code === "6982";
}
```

Afficher le rejet en neutre/ambre, pas en rouge. Ne pas matcher sur `_tag` seul : il varie selon le signer.

Codes utiles : `5515` device verrouillé, `6807` app absente, `6a80` blind signing désactivé, `6e00` mauvaise app.

## Pièges connus

- Le `UnknownDeviceExchangeError` cache le code dans `originalError.errorCode`.
- Un signer doit être recréé à chaque changement de `sessionId`.
- `Session refresher` : à désactiver en multi-onglets (`isRefresherDisabled: true`).
- `next.config.ts` exige Next.js 15+. Un projet standalone consommant les paquets npm doit ajouter `transpilePackages` pour les trois `@ledgerhq/*`.
- `battery` n'est fiable que sur BLE.
- Ne jamais hardcoder un chemin à partir d'une saisie utilisateur.

## Tests

Speculos (`@ledgerhq/device-transport-kit-speculos`) et `setStub(true)` : test et CI uniquement.

## DMK Skills : brancher un agent de code sur le DMK

```bash
npx skills add ledgerhq/agent-skills -s ledger-dmk-implementation dmk-intent-vocabulary dmk-business-logic
```

- `dmk-intent-vocabulary` : traduit une demande floue en API DMK.
- `ledger-dmk-implementation` : processus en 5 étapes (Init, Session, État, App, Opération), avec points de validation humaine.
- `dmk-business-logic` : concepts (Clear Signing, secure channel, sessions, transports, BOLOS, genuine check).

Préciser à l'agent la plateforme, le transport, la chaîne et l'opération. Ex. : « app Vite + React, WebHID, Ethereum, dériver l'adresse et la vérifier sur le device ».
