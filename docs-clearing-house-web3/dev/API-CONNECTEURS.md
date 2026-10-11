# API et connecteurs

## 1. Comptes et accès à obtenir

| Service | Pourquoi | Comment l'obtenir | Coût | Story | Statut |
|---|---|---|---|---|---|
| **Anthropic API** | Agents (explication, outils) | Console Anthropic : créer une clé de test, poser une limite de dépense du workspace | Environ 0,02 $ par appel, plafond proposé 50 $ | S-029 | À faire |
| **RPC Base Sepolia** | Lire et écrire sur le testnet | RPC public `https://sepolia.base.org`, ou un fournisseur gratuit si le débit ne suffit pas | Gratuit | S-014 | Disponible |
| **Faucet Base Sepolia** | ETH de test pour le déployeur et l'agent | Faucet Alchemy : 0,1 ETH par 24 h et par adresse, solde minimal de 0,001 ETH sur Ethereum mainnet. Blast API à éviter | Gratuit | S-014 | À faire, conditions à revérifier |
| **Clé de vérification de contrats** | Code source vérifié sur l'explorateur | Compte Etherscan (API multichaîne) ou Basescan. Vérifier lequel est accepté au moment de S-014 | Gratuit | S-014 | À faire |
| **`originToken` Ledger** | Clear Signing via le signer ETH | Programme partenaire Ledger. Demander sur Discord si un token est possible pour un POC | — | S-006 | À demander (Q-02) |
| **Discord Ledger** | Questions aux mentors (jours ouvrés) | Canal du hackathon | Gratuit | — | Disponible |
| **GitHub** | Dépôt, accès du jury | Dépôt public, ou accès donné au jury (Q-13) | Gratuit | S-039 | À trancher |

Le DMK et wallet-cli ne demandent aucune clé : ils s'installent depuis npm.

## 2. Connecteurs Ledger

### DMK (navigateur, WebHID)

Pile : `@ledgerhq/device-management-kit` + `@ledgerhq/device-transport-kit-web-hid` + `@ledgerhq/device-signer-kit-ethereum` + `@ledgerhq/context-module`.

| Appel | Usage dans le POC | Story |
|---|---|---|
| `new DeviceManagementKitBuilder().addTransport(webHidTransportFactory).build()` | Une seule instance, dans un Provider React | S-005 |
| `dmk.startDiscovering({ transport: webHidIdentifier })` puis `dmk.connect({ device })` | Sur un clic, jamais au chargement | S-005 |
| `new SignerEthBuilder({ dmk, sessionId, originToken }).build()` | `originToken` optionnel, sans lui l'écran affiche du hex | S-006 |
| `signerEth.getAddress(path, { checkOnDevice: true })` | Adresses A, B, C | S-007 |
| `signerEth.signMessage(path, text)` | Règles de mandat (EIP-191) et repli des instructions | S-019, S-020 |
| `signerEth.signTypedData(path, typedData)` | Instructions EIP-712 | S-020 |
| `signerEth.signTransaction(path, rlpBytes)` | Approbations et règlement | S-021 |

Chaque appel renvoie `{ observable, cancel }`. Gérer les états `Pending` (interaction requise), `Completed` (lire `state.output`), `Error` (classer le refus utilisateur à part : codes `5501`, `6985`, `RefusedByUserDAError`).

Contraintes : Chromium uniquement, HTTPS ou localhost, une seule commande sur le Flex à la fois. Les signatures exactes sont à vérifier dans les types npm : les versions installées (DMK 1.11.0, signer 1.18.1) sont plus récentes que celles documentées dans les skills Ledger.

Référence détaillée : skill `ledger-dmk-signer` (`ledger-hackathon-docs/skills/`).

### wallet-cli (Key Ring)

Seul usage : chiffrer la configuration des agents (S-023). wallet-cli ne gère pas les transactions sur testnet.

```bash
WALLET_PASS=$(security find-generic-password -a default -s ledger-wallet-cli -w) wallet-cli ring init
```

```bash
WALLET_PASS=$(security find-generic-password -a default -s ledger-wallet-cli -w) wallet-cli ring encrypt --key clearing-house-config -i .env -o .env.enc
```

```bash
WALLET_PASS=$(security find-generic-password -a default -s ledger-wallet-cli -w) wallet-cli ring decrypt --key clearing-house-config -i .env.enc -o .env
```

Ne jamais afficher le fichier déchiffré. Référence : skill `ledger-key-ring`.

### Anthropic (serveur)

- Modèle `claude-opus-5-5`, SDK `@anthropic-ai/sdk`.
- Outils déclarés avec `strict: true`. Ne jamais forcer `tool_choice` à `any` ou `tool` : ce modèle renvoie une erreur 400.
- Vérifier `stop_reason` avant de lire le contenu, y compris le cas `refusal`.
- Repli serveur des refus recommandé : `fallbacks: "default"` avec l'en-tête bêta `server-side-fallback-2026-07-01`. Syntaxe à confirmer dans la documentation Anthropic avant de coder (skill `claude-api`).

## 3. Contrats d'interface entre modules

Contrats proposés, à figer au démarrage des stories citées. Ils permettent aux deux flux de développer en parallèle.

### Contrats Solidity

| Contrat | Fonction ou événement | Story |
|---|---|---|
| `ShareToken` | `setAllowed(address account, bool allowed)`, `mint(address to, uint256 amount)` (propriétaire), transfert refusé hors liste blanche | S-009 |
| `MockCash` | `mint(address to, uint256 amount)` (propriétaire), 6 décimales | S-010 |
| `SettlementEscrow` | `deposit(address token, uint256 amount)`, `withdraw(address token, uint256 amount)` refusé si engagé dans un lot | S-011 |
| `SettlementEscrow` | `settle(bytes32 cycleId, uint8 mode, Leg[] legs, bytes32 merkleRoot)` avec `Leg { address participant; int256 cashDelta; int256 sharesDelta; }` : somme nulle par actif, couverture vérifiée, tout ou rien | S-011, S-042 |
| `SettlementEscrow` | `event SettlementRoot(bytes32 cycleId, uint8 mode, bytes32 merkleRoot, bytes32 legsHash)` | S-012 |
| `NavRegistry` | `publish(bytes32 fundId, uint64 navDate, bytes32 inputsHash, bytes32 resultHash)` (publieur autorisé), `event NavPublished(...)` | S-041 |

### Moteur TypeScript (`@chw3/engine`)

Fonctions pures, montants en `bigint`.

| Fonction | Entrée | Sortie | Story |
|---|---|---|---|
| `computeNetPositions(instructions, nav)` | Instructions validées, NAV | Soldes nets par participant et par fonds | S-015 |
| `checkCoverage(positions, deposits)` | Soldes nets, dépôts en séquestre | Résultat avec participants non couverts et montants manquants | S-016 |
| `buildLot(cycleId, mode, positions)` | Cycle, mode, soldes | `Lot` prêt pour `settle` | S-042 |
| `merkleRoot(lot)` | Lot | Racine identique au contrat | S-017 |
| `computeNav(inputs)` | Avoirs, prix, passifs, nombre de parts | NAV | S-041 |
| `hashNavInputs(inputs)`, `hashNavResult(result)` | Entrées et résultat | Empreintes `bytes32` | S-041 |

### API du serveur (Fastify, JSON)

| Méthode et route | Rôle | Story |
|---|---|---|
| `GET /health` | Vérification de démarrage | S-030 |
| `POST /mandates` | Enregistrer des règles signées (EIP-191 vérifiée) | S-019 |
| `GET /mandates/:participant` | Lire le mandat d'un participant | S-019 |
| `POST /instructions` | Soumettre une instruction signée ; refus si signature ou mandat invalide | S-020, S-022, S-026 |
| `GET /instructions?cycleId=` | Lister les instructions et leur statut | S-031 |
| `GET /nav/:fundId/:date` | Mock NAV, selon `NAV_SCENARIO` | S-024 |
| `POST /nav/:fundId/:date/publish` | Calculer et publier les empreintes on-chain | S-041 |
| `POST /cycles/:cycleId/net` | Netting et couverture, renvoie le lot et la racine | S-015, S-016 |
| `POST /cycles/:cycleId/settlement` | Préparer les transactions à signer sur le Flex | S-021, S-042 |
| `POST /agent/explain` | Explication par le LLM, sans chiffre nouveau | S-025, S-027 |
| `POST /scenarios/injection` | Jouer la dépêche malveillante | S-028 |

Toute entrée externe est validée avec `zod` à l'entrée de la route.
