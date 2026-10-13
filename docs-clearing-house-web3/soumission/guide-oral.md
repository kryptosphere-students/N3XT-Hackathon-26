# Guide oral pour Mark

Tout ce qu'il faut comprendre pour répondre au jury sans notes. Chemins relatifs à `clearing-house-web3/`.

## 1. Le trajet complet d'un ordre

Exemple suivi : Manager A envoie « Please subscribe 100 units of Fund F », NAV 105, cycle du jour.

### a. L'email arrive (apps/server/src/routes/intake.ts)

`POST /intake { emailText }`. La route appelle `runIntakeAgent` (`agents/intake.ts`).

- `agents/llm.ts`, `createLlmClient` : un `fetch` sur `LLM_BASE_URL/chat/completions` (OpenRouter, API compatible OpenAI). Pas de SDK. `max_tokens` plafonné à 500 (`agents/config.ts`, `MAX_TOKENS_PER_CALL`), `temperature: 0`.
- `agents/tools.ts` : un seul outil déclaré au modèle, `draft_instruction`, avec un schéma JSON (fund, side, units en chaîne, participant). Côté serveur, le même schéma en zod (`draftInstructionArgsSchema`), qui refuse un fonds inconnu ou des parts qui ne sont pas un nombre.
- `agents/intake.ts`, `runIntakeAgent` : deux tours maximum. Tour 1, le modèle appelle l'outil. `handleToolCall` vérifie le nom (liste blanche), puis les arguments (zod), puis construit le `Draft`. Les parts passent par `parseUnits(units, 6)` : c'est notre code qui fait la conversion en bigint, pas le modèle. Tour 2, le modèle reçoit le résultat de l'outil et écrit l'explication. Si un outil inconnu est demandé, il est refusé et journalisé (`refusedTools`). Si le modèle principal plante, un essai avec `LLM_FALLBACK_MODEL`.
- Retour dans `routes/intake.ts`, `checkDraft` : le nom du participant (« Manager A ») est résolu en adresse via la config (`routes/config.ts`, `configFromEnv`, adresses de `.env`), puis `checkInstruction` de l'adaptateur moteur avec le dernier mandat signé (`latestMandate`, `routes/mandates.ts`) et le cash déjà engagé dans le cycle (`cashCommittedInCycle`, `routes/instructions.ts`).

Réponse : `{ draft, explanation, modelUsed, refusedTools, check: { ok, reasons } }`. Rien n'est stocké. Le brouillon n'existe que dans le navigateur.

### b. Le gérant signe (apps/web)

- `components/IntakePanel.tsx` : si `check.ok`, le bouton « Send the draft to the order form » envoie `{ who, side, units }` à `InstructionForm`.
- `components/InstructionForm.tsx` : construit un `InstructionPayload` (`packages/protocol/src/instruction.ts`) : id aléatoire de 3 octets, cycle du jour, adresse du fonds (de `/config`), adresse du participant (lue sur la Flex), side, parts en bigint, nonce (`GET /participants/:address/nonces`). `instructionToText` produit les cinq lignes affichées dans l'encadré « Your Flex will show ». C'est exactement ce qui est signé.
- `ledger/sign.ts`, `signText` : `signer.signMessage(path, text)` du DMK. La Flex affiche le texte, le gérant approuve. Le DMK rend `{ r, s, v }`, `serializeSignature` de viem en fait un hex de 65 octets.
- `ledger/accounts.ts` : les trois chemins `44'/60'/n'/0/0` sont des constantes. Jamais saisis par l'utilisateur.
- `ledger/dmk.tsx` : le DMK est créé dans le provider React (`useState(buildDmk)`), pas en singleton de module. `originToken` vide ou non, `signMessage` marche.

### c. Le serveur vérifie et stocke (apps/server/src/routes/instructions.ts)

`POST /instructions` :

1. `instructionBodySchema` (`schemas.ts`) : adresses en regex, montants en chaîne décimale convertie en bigint, nonce entier. Toute validation d'entrée externe est ici.
2. Le serveur **reconstruit** le texte avec `instructionToText` (même fonction que le navigateur) et vérifie `verifyEip191(participant, text, signature)` (`signatures.ts`, `verifyMessage` de viem). Un champ modifié après signature donne un autre texte, donc 401.
3. Nonce déjà utilisé par ce participant : 409.
4. `checkInstruction` (mandat) : statut `signed` ou `rejected` avec les motifs. Un ordre refusé est gardé pour l'audit mais n'entre jamais dans un lot.
5. `store.append("instructions", ...)` : `store.ts`, un fichier JSON par collection dans `data/store/`.

### d. Le lot (apps/server/src/routes/lots.ts)

`POST /cycles/:cycleId/lots { mode }` :

- Candidats : les ordres `signed` du cycle sans `lotId`. Mode `instant` : un seul (le dernier, ou `instructionId`). Mode `netting` : tous.
- `netPositions(instructions, navPerUnit, fund)` (`engine-adapter.ts`) : par participant, somme des parts signées et du cash (`floor(parts × NAV / 1e6)`, signe opposé). Le fonds prend l'opposé des sommes. Le lot somme à zéro.
- `checkCoverage(lot, balances)` : `chain.balances` lit `balances(participant, token)` sur l'escrow. Un participant à découvert : 409.
- `lotHash(lot, shareToken, cashToken)` : `keccak256(abi.encode(lotId, shareToken, cashToken, navPerUnit, positions))`, le même calcul que `hashLot` du contrat. Vérifié par un test avec des valeurs de référence (`contracts/README.md`).
- `navHash(config.navInputs)` : `packages/engine/src/nav.ts` (Louis). Les entrées du mock d'administrateur (`packages/engine/fixtures/nav-fund-f.json` : positions, passif, parts en circulation) donnent `computeNav` = 105.000000, et le hash couvre entrées et résultat, encodés en ABI.
- Stocké avec `approvers` = les participants non fonds. Les ordres passent `in_lot`.

### e. Les approbations

`GET /lots/:id` renvoie `texts[participant]` = `lotApprovalToText` (`packages/protocol/src/lot.ts`) : « Lot 1, Fund F / You receive 100 units / You pay 10500 cash / Lot hash 0xe619...af39 / Full hash 0x... ». Le navigateur affiche ce texte, la Flex le montre, le gérant signe.

`POST /lots/:id/approvals { participant, signature }` : participant dans `approvers` sinon 403 ; `verifyEip191` sur le texte reconstruit sinon 401. Quand tous ont signé, `settle(lot)` est appelé.

### f. Le règlement (apps/server/src/chain.ts)

Dans `settle` de `routes/lots.ts`, **toutes les signatures sont revérifiées** juste avant l'envoi. Puis `chain.settle` : `walletClient.writeContract` avec le compte dérivé de `AGENT_PRIVATE_KEY`, `settle(lotId, navPerUnit, positions, navHash, signatures)`, puis `waitForTransactionReceipt`. Le hash de transaction est stocké, les ordres passent `settled`, `delays` mesure le temps depuis le premier ordre.

## 2. Les contrats (contracts/src)

### ShareToken.sol

ERC-20 OpenZeppelin, 6 décimales. `Ownable` : le gérant du fonds.

- `setWhitelisted(address, bool)` : liste blanche, événement `WhitelistUpdated`.
- `setMinter(address)` : l'escrow, pour préfinancer sans signature.
- `mint(to, amount)` : owner ou minter.
- `_update` (hook de tout transfert) : revert `NotWhitelisted` si le destinataire n'est pas listé. Les burns restent possibles.

### MockCash.sol

ERC-20, 6 décimales, `mint` libre. Argent de test, rien d'autre.

### SettlementEscrow.sol

- `balances[participant][token]` : soldes internes. `settled[lotId]` : anti-rejeu.
- `creditPrefund(participant, token, amount)`, owner : mint vers l'escrow et crédite le solde. C'est ainsi que personne ne signe d'`approve` sur la Flex.
- `withdraw(token, amount)` : le participant retire. Checks, effects, puis `safeTransfer`.
- `settle(lotId, navPerUnit, positions, navHash, signatures)`, rôle `engine` seulement (l'adresse de l'agent) : refuse si `lotId` déjà réglé, si la somme des parts ou du cash n'est pas nulle, si un solde deviendrait négatif, si un participant avec des parts n'est pas listé. Un seul `revert` annule tout : tout ou rien. Émet `LotSettled(lotId, lotHash, navHash, signatures)`.
- `hashLot` : `keccak256(abi.encode(lotId, shareToken, cashToken, navPerUnit, positions))`, public, utilisé par le moteur pour la parité.

Tests (`contracts/test`) : 29, dont deux fuzz : tout lot équilibré dans les limites se règle et conserve les totaux, tout lot déséquilibré revert. Déployé et vérifié sur Base Sepolia (adresses dans le README).

## 3. Les 15 questions probables

1. **Pourquoi EIP-191 et pas EIP-712 ou des appels au contrat depuis la Flex ?** Testé le 11 octobre : sans descripteur ERC-7730 dans le registre, la Flex demande le blind signing pour nos types et nos contrats. Confirmé par les mentors. Du texte, la Flex l'affiche en clair. Le prix : l'escrow fait confiance au moteur pour vérifier les signatures.

2. **Le contrat vérifie-t-il les signatures ?** Non. Elles sont vérifiées par le serveur avant l'envoi, revérifiées juste avant la transaction, et publiées dans `LotSettled` : n'importe qui peut les recalculer après coup avec le texte. La vérification dans le contrat est en roadmap, la branche `mark/onchain-verify` en est un début.

3. **Que fait l'agent exactement ?** Il lit un email, appelle un seul outil avec quatre champs texte, et explique. Il ne calcule aucun montant (les parts sont une chaîne convertie par notre code), ne construit aucune transaction, ne signe rien. Tout appel d'outil hors liste est refusé.

4. **Et si l'agent se fait avoir par l'email piégé ?** Le brouillon passe par `checkInstruction`, du code : fonds autorisé, sens autorisé, cash du cycle sous le plafond signé. Refus avec motif. La Flex n'est jamais sollicitée, il n'y a pas de bouton. Même si le gérant signait un tel ordre à la main, le serveur le marquerait `rejected`.

5. **Pourquoi un mandat signé plutôt qu'une configuration serveur ?** Parce que le plafond vient du gérant, prouvé par sa clé, pas d'un fichier que l'opérateur peut changer. Le mandat est du texte signé sur la Flex, réutilisable, avec un nonce.

6. **Comment le netting réduit-il le cash ?** Dans l'exemple, A souscrit 100, B rachète 40 : 140 parts et 14 700 de cash en brut, 60 parts et 6 300 en net. Le fonds ne bouge que le net, 57 % de cash en moins. C'est une conséquence, pas la promesse principale (D2).

7. **Pourquoi des soldes préfinancés ?** Parce qu'un `approve` ou un `transfer` de nos tokens de test serait du blind signing sur la Flex. L'owner préfinance au déploiement. En production, le dépositaire préfinance.

8. **Le lot hash, à quoi sert-il ?** Il lie l'approbation du participant à ce lot exact (dans le texte signé) et il est émis par le contrat. Même formule des deux côtés, test de parité avec des valeurs de référence.

9. **Le mode instantané, c'est un code à part ?** Non. Un lot d'un ordre, deux lignes, même `settle`. Testé dans Foundry et sur anvil.

10. **La NAV ?** Calculée par le moteur à partir d'un fichier du mock d'administrateur : somme des positions valorisées moins le passif, divisée par les parts en circulation, arrondie vers le bas. 105.000000 dans la démo. Le hash des entrées et du résultat part avec le lot dans `LotSettled`, un auditeur le recalcule. Pas d'oracle de prix, c'est assumé (D3).

11. **Key Ring, pourquoi ?** La clé OpenRouter de l'agent est chiffrée avec une clé dérivée de la seed Ledger, et déchiffrée au démarrage par `wallet-cli ring decrypt` en sous-processus. Le mot de passe du ring est dans `WALLET_PASS`, saisi dans le terminal, jamais dans un fichier. Sans le fichier chiffré, le serveur dit « plain .env (fallback) » dans l'en-tête.

12. **Qu'est-ce qui est irréversible et qui l'approuve ?** Le mandat, chaque ordre, chaque lot : le gérant sur la Flex. Le `settle` : la clé du moteur, seulement après toutes les approbations. Le préfinancement : l'owner, au déploiement. Tableau dans le README.

13. **Trois comptes sur une seule Flex, c'est réaliste ?** C'est pour la démo. Chemins `44'/60'/n'/0/0`, constantes dans le code. En production, chaque gérant a son appareil, rien ne change dans le code.

14. **Qu'avez-vous appris sur les outils Ledger ?** Le DMK marche du premier coup une fois Ledger Wallet fermé. Le piège, c'est le Clear Signing : l'erreur `6a80` ressemble à un bug de données alors que c'est un refus de blind signing. `wallet-cli` passe en JSON quand la sortie n'est pas un terminal. Tout est dans `DX_FEEDBACK.md`.

15. **Qu'est-ce qui est généré par IA ?** Claude Code a servi d'outil pendant le hackathon, par petites étapes relues et testées. Chaque décision est dans `DECISIONS.md`, chaque friction dans `DX_FEEDBACK.md`. Le code tourne, les tests passent, et je peux expliquer chaque fonction.

## 4. Les limites à dire soi-même

- L'escrow fait confiance au moteur pour les signatures (publiées, vérifiables après coup).
- Préfinancement par l'owner, tokens de test, un fonds, trois participants.
- NAV calculée depuis un fichier de mock, pas d'oracle.
- Le moteur (`packages/engine`) est de Louis, fusionné le 12 au soir (D13). Mark en avait une copie provisoire côté serveur, supprimée à la fusion.
- Stockage en fichiers JSON, pas de base, pas de multi-utilisateur.
- Pas de retrait bloqué pendant qu'un lot est en attente : la couverture est vérifiée à la création du lot et le contrat refuse tout solde négatif au règlement.

## 5. Chiffres à avoir en tête

- 29 tests Foundry, 4 tests protocol, 42 tests serveur dont un règlement complet sur anvil.
- 3 contrats vérifiés sur Base Sepolia, déploiement à 0,00007 ETH.
- Ordre à règlement mesuré sur anvil : 9 s en netting (avec deux approbations), 0 s en instantané.
- 57 % de cash en moins sur le lot de démo.
