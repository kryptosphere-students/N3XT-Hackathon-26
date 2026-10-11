# Installation et initialisation

Versions vérifiées sur le registre npm le 11 octobre 2026. La section 3 décrit ce qui a été fait pendant S-043 (11 octobre, Windows 11). Le monorepo existe : un nouveau clone n'a besoin que de la section 1 puis de `npm install` et `npm test` dans `clearing-house-web3/`.

## 1. Outils à installer sur la machine

| Outil | Version | Pourquoi | Installation | Vérification |
|---|---|---|---|---|
| macOS, Linux ou Windows | | Poste de développement. Sous Windows : Git Bash pour `foundryup`, puis `forge` est dans `%USERPROFILE%\.foundry\bin` (ajouté au PATH utilisateur, rouvrir le terminal) | selon l'OS | aucune |
| Node.js | 22 LTS | Serveur, moteur, web | nvm, fnm ou installeur officiel | `node --version` |
| npm | 10 | Workspaces du monorepo | Fourni avec Node | `npm --version` |
| Foundry | dernière stable | Contrats : `forge`, `cast`, `anvil` | `curl -L https://foundry.paradigm.xyz \| bash` puis `foundryup` | `forge --version` |
| Navigateur Chromium | Chrome, Edge ou Brave | WebHID n'existe que sur Chromium | site du navigateur | aucune |
| Ledger Wallet (ex-Ledger Live) | à jour | Firmware et apps du Flex | Site Ledger | aucune |
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
| `viem` | 2.57.4 | web, serveur, moteur | Encodage, signatures, RPC. Le hash du lot (D8) se fait avec `keccak256` de viem, pas de bibliothèque Merkle |
| `react` | 19.3.0 | web | Installé par le template Vite |
| `vite` | 8.3.4 | web | Template via `create-vite` 9.2.1 |
| `@openzeppelin/contracts` | 5.6.1 | contrats | Installé par npm, pas en sous-module git |
| `forge-std` | 1.17.0 | contrats | devDependency npm `github:foundry-rs/forge-std#v1.17.0`, pas de `contracts/lib` |
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

## 3. Comment le monorepo a été initialisé (S-043, fait le 11 octobre)

Tout se passe dans `clearing-house-web3/`. Les commandes prévues au départ sont gardées ici avec ce qui a changé en pratique.

**Racine et workspaces**

`npm init -y` puis `npm pkg set ...` produisent `"private": "true"` (chaîne, pas booléen), `"type": "commonjs"` et une licence ISC. Le `package.json` racine a donc été écrit à la main : `private: true`, `type: module` (sinon `eslint.config.js` en `import` ne charge pas), licence MIT, workspaces `contracts`, `packages/*`, `apps/*`, scripts `test`, `lint`, `typecheck`.

```bash
npm install -D typescript@6.0.3 eslint@10.12.0 typescript-eslint@8.71.1 @types/node
```

`eslint.config.js` à la racine, avec `defineConfig` de `eslint/config` et `tseslint.configs.recommended` : fonctionne tel quel avec ESLint 10.

**Nouveau workspace : écrire le `package.json` à la main**

`npm install -w <workspace> <paquet>` sur un workspace qui vient d'être créé n'écrit pas la dépendance dans son `package.json` quand le paquet est déjà présent à la racine (vu avec `viem` et `@openzeppelin/contracts`). Pour chaque workspace, le `package.json` a été écrit directement (nom `@chw3/...`, `private`, scripts, dépendances aux versions ci-dessus), puis un seul `npm install` à la racine.

**Web**

La page de test Flex existait déjà (`web/`, S-005 et S-006, créée avec `create-vite` 9.2.1). Elle a été déplacée avec `git mv` fichier par fichier dans `apps/web` (le `git mv` du dossier échoue sous Windows tant que `node_modules` existe). Supprimés : `eslint.config.js`, `.gitignore` et `package-lock.json` de l'app, et ses devDependencies ESLint. Renommée `@chw3/web`, avec `@ledgerhq/context-module`, `viem` et `@chw3/engine` en plus.

**Moteur** : `packages/engine`, `@chw3/engine`, `viem` seulement. Tests `vitest run`, typecheck `tsc --noEmit`. Le `tsconfig.json` a `allowImportingTsExtensions` pour importer `../src/index.ts` depuis les tests.

**Serveur** : `apps/server`, `@chw3/server`. `src/app.ts` construit l'instance Fastify (`buildServer`), `src/index.ts` l'écoute sur `SERVER_PORT` (8787 par défaut). Les tests importent `app.ts` et utilisent `app.inject`, sans ouvrir de port.

**Contrats**

```bash
forge init contracts --no-git
```

`forge init` copie `forge-std` dans `contracts/lib/forge-std`. Ce dossier a été supprimé : `forge-std` est une devDependency npm (`github:foundry-rs/forge-std#v1.17.0`, dernier tag stable), installée dans `node_modules` avec le reste. Pas de `forge install`, pas de `lib/`. Les exemples `Counter.*` et le README de Foundry ont aussi été supprimés.

`contracts/remappings.txt` :

```
@openzeppelin/contracts/=../node_modules/@openzeppelin/contracts/
forge-std/=../node_modules/forge-std/src/
```

Solc refuse par défaut les fichiers hors de `contracts/` (`File outside of allowed directories`). `foundry.toml` a donc `libs = ["../node_modules"]` et fixe `solc_version = "0.8.30"`. `test/Setup.t.sol` vérifie que les deux remappings se résolvent.

**Vérification**

```bash
npm install
npm test
npm run lint
npm run typecheck
```

`npm test` enchaîne `forge test`, puis vitest sur le moteur et le serveur. Aucun commit automatique : `forge init --no-git` n'en crée pas.

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
