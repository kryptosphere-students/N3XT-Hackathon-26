# Installation et initialisation

Versions vérifiées sur le registre npm le 11 octobre 2026. Les commandes de la section 3 n'ont pas encore été exécutées : la première personne qui les lance (S-043) corrige ce fichier et note les écarts dans `DX_FEEDBACK.md`.

## 1. Outils à installer sur la machine

| Outil | Version | Pourquoi | Installation | Vérification |
|---|---|---|---|---|
| macOS ou Linux | — | Poste de développement | — | — |
| Node.js | 22 LTS | Serveur, moteur, web | nvm, fnm ou installeur officiel | `node --version` |
| npm | 10 | Workspaces du monorepo | Fourni avec Node | `npm --version` |
| Foundry | dernière stable | Contrats : `forge`, `cast`, `anvil` | `curl -L https://foundry.paradigm.xyz \| bash` puis `foundryup` | `forge --version` |
| Navigateur Chromium | Chrome, Edge ou Brave | WebHID n'existe que sur Chromium | — | — |
| Ledger Wallet (ex-Ledger Live) | à jour | Firmware et apps du Flex | Site Ledger | — |
| wallet-cli | 2.9.0 | Key Ring (`ring`) uniquement | `npm i -g @ledgerhq/wallet-cli@2.9.0` | `wallet-cli --version` |
| Git, GitHub CLI | récents | Dépôt, PR | Homebrew ou paquets système | `git --version`, `gh --version` |
| Python 3 et Slither | optionnel | Analyse statique des contrats | `pip install slither-analyzer` | `slither --version` |

Sur Linux, installer les règles udev Ledger pour que le Flex soit détecté (dépôt `LedgerHQ/udev-rules`).

Le Flex doit avoir l'app **Ethereum** et, pour Key Ring, l'app **Ledger Sync** (S-008).

## 2. Paquets du projet

| Paquet | Version | Module | Note |
|---|---|---|---|
| `@ledgerhq/device-management-kit` | 1.11.0 | web | Plus récent que la version connue des skills Ledger (1.2.0) : vérifier les signatures dans les types npm |
| `@ledgerhq/device-transport-kit-web-hid` | 1.2.4 | web | |
| `@ledgerhq/device-signer-kit-ethereum` | 1.18.1 | web | Exige `@ledgerhq/context-module` ^2.6.0 et le DMK ^1.9.1 |
| `@ledgerhq/context-module` | 2.6.0 | web | Obligatoire avec le signer Ethereum |
| `rxjs` | 7.8.2 | web | Version exacte exigée par le DMK |
| `viem` | 2.57.4 | web, serveur, moteur | Encodage, signatures, RPC |
| `react` | 19.3.0 | web | Installé par le template Vite |
| `vite` | 8.3.4 | web | Template via `create-vite` 9.2.1 |
| `@openzeppelin/merkle-tree` | 1.0.8 | moteur | Même format de feuilles que `MerkleProof` d'OpenZeppelin |
| `@openzeppelin/contracts` | 5.6.1 | contrats | Installé par npm, pas en sous-module git |
| `fastify` | 5.12.5 | serveur | API HTTP |
| `zod` | 4.6.5 | serveur | Validation des entrées externes |
| `@anthropic-ai/sdk` | 0.133.0 | serveur | Modèle `claude-opus-5-5` |
| `vitest` | 5.0.3 | moteur, serveur | Tests |
| `fast-check` | 4.10.2 | moteur | Tests de propriétés |
| `tsx` | 4.23.15 | serveur | Exécution TypeScript en développement |
| `typescript` | **6.0.3** | racine | Pas la 7.x : `typescript-eslint` exige une version inférieure à 6.1 |
| `eslint` | 10.12.0 | racine | |
| `typescript-eslint` | 8.71.1 | racine | |

Choix faits : **npm workspaces** plutôt que pnpm (npm est déjà installé, une dépendance de moins). **Fichiers JSON** plutôt que SQLite pour le stockage (pas de module natif à compiler, comme le permet la spec).

## 3. Initialiser le monorepo (S-043, une seule fois)

À lancer depuis `clearing-house-web3/`. Ne pas commiter avant d'avoir vérifié `git status`.

**Racine et workspaces**

```bash
npm init -y
```

```bash
npm pkg set private=true name=clearing-house-web3 'workspaces[0]=contracts' 'workspaces[1]=packages/*' 'workspaces[2]=apps/*'
```

**Contrats (Foundry)**

```bash
forge init contracts --no-git
```

Si `contracts/lib/forge-std` est absent après cette commande :

```bash
forge install foundry-rs/forge-std --root contracts --no-git
```

```bash
cd contracts && npm init -y && npm pkg set name=@chw3/contracts private=true scripts.test="forge test" scripts.build="forge build" && cd ..
```

```bash
npm install -w contracts @openzeppelin/contracts@5.6.1
```

Créer `contracts/remappings.txt` :

```
@openzeppelin/contracts/=../node_modules/@openzeppelin/contracts/
forge-std/=lib/forge-std/src/
```

**Moteur (TypeScript pur, sans I/O)**

```bash
mkdir -p packages/engine/src packages/engine/test && cd packages/engine && npm init -y && npm pkg set name=@chw3/engine type=module private=true main=src/index.ts scripts.test="vitest run" scripts.typecheck="tsc --noEmit" && cd ../..
```

```bash
npm install -w packages/engine viem@2.57.4 @openzeppelin/merkle-tree@1.0.8
```

```bash
npm install -w packages/engine -D vitest@5.0.3 fast-check@4.10.2
```

**Serveur (API, agents, mock NAV)**

```bash
mkdir -p apps/server/src apps/server/test && cd apps/server && npm init -y && npm pkg set name=@chw3/server type=module private=true scripts.dev="tsx watch src/index.ts" scripts.test="vitest run" scripts.typecheck="tsc --noEmit" && cd ../..
```

```bash
npm install -w apps/server fastify@5.12.5 zod@4.6.5 viem@2.57.4 @anthropic-ai/sdk@0.133.0 @chw3/engine
```

```bash
npm install -w apps/server -D tsx@4.23.15 vitest@5.0.3
```

**Web (Vite, React, DMK)**

```bash
npm create vite@9.2.1 apps/web -- --template react-ts
```

```bash
npm install -w apps/web @ledgerhq/device-management-kit@1.11.0 @ledgerhq/device-transport-kit-web-hid@1.2.4 @ledgerhq/device-signer-kit-ethereum@1.18.1 @ledgerhq/context-module@2.6.0 rxjs@7.8.2 viem@2.57.4 @chw3/engine
```

Le template Vite apporte sa propre configuration ESLint : la supprimer pour garder une seule configuration à la racine.

**Outils communs à la racine**

```bash
npm install -D typescript@6.0.3 eslint@10.12.0 typescript-eslint@8.71.1 @types/node
```

```bash
npm pkg set scripts.test="npm run test --workspaces --if-present" scripts.lint="eslint . --max-warnings 0" scripts.typecheck="npm run typecheck --workspaces --if-present"
```

Créer `eslint.config.js` à la racine (syntaxe à vérifier avec ESLint 10) :

```js
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["**/node_modules/**", "**/dist/**", "contracts/**", "data/**"] },
  tseslint.configs.recommended,
);
```

**Vérification finale**

```bash
npm install
```

```bash
npm test
```

## 4. Commandes de développement

Chaîne locale, pour itérer sans faucet :

```bash
anvil
```

Déploiement local (le script `Deploy.s.sol` est écrit dans S-014) :

```bash
forge script contracts/script/Deploy.s.sol --root contracts --rpc-url http://127.0.0.1:8545 --broadcast
```

Serveur :

```bash
npm run dev -w apps/server
```

Web (ouvrir dans Chrome, sur `localhost`) :

```bash
npm run dev -w apps/web
```

Les ABI des contrats sont générées par `forge build` dans `contracts/out/`, exclu du dépôt. Lancer `forge build` avant de démarrer le serveur ou le web.
