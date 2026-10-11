# Placeholders à remplir

Trois familles : les variables du `.env`, les constantes à figer dans le code, et les valeurs produites pendant le développement à reporter dans le README.

## 1. Variables d'environnement

Fichier : `clearing-house-web3/.env`, copié depuis `.env.example`. Jamais commité.

Les variables préfixées `VITE_` sont lues par le navigateur : elles sont **publiques**. N'y mettre aucun secret.

| Variable | Exemple ou valeur | Secret | Où l'obtenir | Story |
|---|---|---|---|---|
| `CHAIN_ID` | `84532` | non | Identifiant de Base Sepolia | S-014 |
| `RPC_URL` | `https://sepolia.base.org` | non | RPC public de Base (limité en débit) ou fournisseur gratuit | S-014 |
| `DEPLOYER_PUBLIC_KEY` | `0x…` | non | Adresse du wallet déployeur | S-014 |
| `AGENT_PUBLIC_KEY` | `0x…` | non | Adresse du wallet agent, rôle `engine` de l'escrow | S-014 |
| `DEPLOYER_PRIVATE_KEY` | `0x…` | **oui** | Wallet de test créé avec `cast wallet new` | S-014 |
| `AGENT_PRIVATE_KEY` | `0x…` | **oui** | Wallet de test, gaz et publication d'empreintes seulement | S-014, S-041 |
| `ETHERSCAN_API_KEY` | `…` | **oui** | Compte Etherscan (API multichaîne) ou Basescan, à vérifier au moment de S-014 | S-014 |
| `OPENROUTER_API_KEY` | `sk-or-…` | **oui** | Compte OpenRouter, avec plafond de dépense | S-029 |
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` | non | API compatible OpenAI | S-029 |
| `LLM_MODEL` | `deepseek/deepseek-v4.1-flash` | non | D12 | S-027 |
| `LLM_FALLBACK_MODEL` | `qwen/qwen3.7-flash` | non | Utilisé si le modèle principal ne gère pas l'appel d'outil | S-027 |
| `NAV_SCENARIO` | `normal`, `stale` ou `wrong` | non | Choix de démo | S-024 |
| `INSTRUCTION_SIGNING_MODE` | `eip191` | non | Résultat du test S-006 (D6) | S-020 |
| `SERVER_PORT` | `8787` | non | Libre | S-030 |
| `SHARE_TOKEN_ADDRESS` | `0x…` | non | Sortie du déploiement | S-014 |
| `CASH_TOKEN_ADDRESS` | `0x…` | non | Sortie du déploiement | S-014 |
| `ESCROW_ADDRESS` | `0x…` | non | Sortie du déploiement | S-014 |
| `PARTICIPANT_A_ADDRESS` | `0x…` | non | Compte 0 du Flex | S-007 |
| `PARTICIPANT_B_ADDRESS` | `0x…` | non | Compte 1 du Flex | S-007 |
| `PARTICIPANT_C_ADDRESS` | `0x…` | non | Compte 2 du Flex | S-007 |
| `FUND_ADDRESS` | `0x…` | non | Adresse du fonds, participant du lot (D11). Vide : adresse du déployeur | S-014 |
| `KEY_RING_KEY_NAME` | `clearing-house-config` | non | Nom de clé Key Ring | S-023 |
| `VITE_SERVER_URL` | `http://localhost:8787` | non | Adresse du serveur | S-030 |
| `VITE_CHAIN_ID` | `84532` | non | Copie de `CHAIN_ID` | S-030 |
| `VITE_ESCROW_ADDRESS` | `0x…` | non | Copie de `ESCROW_ADDRESS` | S-021 |
| `VITE_LEDGER_ORIGIN_TOKEN` | vide | non, mais lié au partenaire | Programme partenaire Ledger, via Discord (Q-02). Vide : blind signing | S-006 |

**Jamais dans `.env`** : la seed, le code PIN du Flex, le mot de passe Key Ring (`WALLET_PASS`, injecté depuis le trousseau au moment de la commande).

## 2. Constantes à figer dans le code

Ces valeurs ne sont pas de la configuration : elles font partie du protocole. Les changer en cours de route casse les signatures ou la parité des racines.

| Constante | Valeur proposée | Où | À figer dans |
|---|---|---|---|
| Chemins de dérivation A, B, C | `44'/60'/0'/0/0`, `44'/60'/1'/0/0`, `44'/60'/2'/0/0` | `apps/web/src/ledger/accounts.ts` | S-007 |
| Identifiant du fonds | Le fonds est un participant (D11) : son adresse `FUND_ADDRESS`, nom affiché "Fund F" dans les textes signés | `packages/protocol`, `.env` | S-014, S-019 |
| Décimales du cash | 6 | `MockCash.sol`, moteur | S-010 |
| Décimales des parts | 6 (D11) | `ShareToken.sol`, moteur | S-009 |
| Unité de NAV | Cash (6 décimales) pour une part entière, `navPerUnit` | Moteur, escrow | S-041 |
| Texte des instructions | Gabarit EIP-191 stable (fonds, sens, parts, gérant, nonce) | `packages/protocol` | S-020 |
| Texte des règles de mandat | Gabarit EIP-191 stable (plafond, fonds autorisés, sens autorisés, nonce) | `packages/protocol` | S-019 |
| Hash du lot | `keccak256(abi.encode(lotId, shareToken, cashToken, navPerUnit, positions))`, `positions` = `(address participant, int256 shares, int256 cash)[]` | `SettlementEscrow.sol` et `lot-hash.ts` | S-012, S-017 |
| Modes de règlement | Instantané = lot d'un seul ordre, netting = lot d'un cycle. Pas de champ de mode dans le contrat | Moteur | S-042 |
| Délais d'attente DMK | Découverte 15 s, ouverture d'app 30 s, signature 60 s | `apps/web/src/ledger/` | S-005 |
| Plafond de mandat de démo | 5 000 000 € par cycle | Données de démo | S-026 |

Les valeurs « proposées » sont à valider par le développeur de la story, puis à ne plus modifier.

## 3. Valeurs produites pendant le développement

À reporter dans le README racine (S-037) au fur et à mesure.

| Valeur | Produite par | Où la reporter |
|---|---|---|
| Adresses des contrats sur Base Sepolia | S-014 | README, `.env` |
| Adresses A, B, C | S-007 | README, `.env` |
| Résultat du test Clear Signing (photo, décision) | S-006 | `DECISIONS.md`, `DX_FEEDBACK.md` |
| Hash de transaction d'un règlement de chaque mode | S-042 | README |
| Délais mesurés des deux modes | S-042 | README, présentation |
| Lien de la vidéo de secours | S-036 | README, formulaire |
| Lien du post X ou LinkedIn | S-039 | Formulaire |
