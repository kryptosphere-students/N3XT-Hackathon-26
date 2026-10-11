# Tests et vérifications

Toutes les commandes se lancent depuis `clearing-house-web3/`, sauf mention contraire. Une story passe en `review` quand ses tests sont verts et que le lint ne remonte aucun warning.

## 1. Tout lancer

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

## 2. Contrats (Foundry)

| Objectif | Commande | Stories |
|---|---|---|
| Compiler et générer les ABI | `forge build --root contracts` | toutes |
| Tests unitaires | `forge test --root contracts -vvv` | S-009 à S-012, S-042 |
| Une seule suite | `forge test --root contracts --match-contract SettlementEscrowTest -vvv` | S-011 |
| Fuzzing renforcé (somme nulle, couverture) | `forge test --root contracts --match-test testFuzz --fuzz-runs 5000` | S-013 |
| Couverture de code | `forge coverage --root contracts` | S-013 |
| Format | `forge fmt --root contracts --check` | toutes |
| Analyse statique (optionnel) | `slither contracts` | S-013 |

Invariants que les tests doivent prouver :

- la somme des `cashDelta` et des `sharesDelta` d'un lot vaut zéro ;
- un règlement sans couverture revert sans changer aucun solde ;
- un transfert de parts hors liste blanche revert ;
- un lot de taille 1 (mode instantané) se règle sans cas particulier ;
- un retrait est refusé tant que le participant est engagé dans un lot.

## 3. Moteur

| Objectif | Commande | Stories |
|---|---|---|
| Tests unitaires et de propriétés | `npm test -w packages/engine` | S-015 à S-018, S-041 |
| Une seule suite | `npm exec -w packages/engine -- vitest run test/netting.test.ts` | S-015 |
| Typage | `npm run typecheck -w packages/engine` | toutes |

Les tests de propriétés utilisent `fast-check`, avec au moins 1 000 lots aléatoires (`numRuns: 1000`). Mêmes invariants que Foundry, plus :

- le même lot donne toujours la même racine (déterminisme) ;
- la racine TypeScript est égale à la racine calculée par un test Foundry sur le même lot (S-017) ;
- les mêmes entrées de NAV donnent les mêmes empreintes, une entrée modifiée change l'empreinte (S-041).

## 4. Serveur

| Objectif | Commande | Stories |
|---|---|---|
| Tests des routes (Fastify `inject`, sans réseau) | `npm test -w apps/server` | S-019 à S-028 |
| Typage | `npm run typecheck -w apps/server` | toutes |

Cas négatifs obligatoires :

- instruction sans signature, signée par un autre compte, ou avec un nonce rejoué : refusée (S-022) ;
- règle de mandat non signée : ignorée (S-022) ;
- instruction hors plafond : refusée avec un motif (S-026) ;
- dépêche malveillante : aucune instruction créée, aucun appel au Flex (S-028) ;
- outil non déclaré demandé par le LLM : refusé et journalisé (S-027).

Les tests du serveur ne doivent pas appeler l'API Anthropic : remplacer le client par un double de test.

## 5. Web

| Objectif | Commande |
|---|---|
| Build de production | `npm run build -w apps/web` |
| Typage | `npm run typecheck -w apps/web` |

Le DMK ne se teste pas en automatique dans ce POC : les tests sur le Flex sont manuels (section 6).

## 6. Tests manuels sur le Flex

À faire avec Chrome sur `localhost`, le Flex branché et déverrouillé. Une seule personne manipule le Flex à la fois.

| Test | Résultat attendu | Story |
|---|---|---|
| Connexion depuis un clic | Le sélecteur s'ouvre, le Flex apparaît, une session est créée | S-005 |
| Adresses A, B, C avec vérification sur l'écran | Trois adresses distinctes, identiques à Ledger Wallet | S-007 |
| Signature EIP-712 minimale | Champs lisibles (Clear Signing) ou hex brut, résultat noté | S-006 |
| Signature des règles | Texte lisible, signature acceptée par le serveur | S-019 |
| Refus sur le Flex | Statut « refusé sur le boîtier », pas d'erreur rouge | S-031 |
| Approbation d'un règlement | Transaction affichée, règlement confirmé sur Base Sepolia | S-021 |
| Scénario d'attaque | Aucune demande de signature sur le Flex | S-034 |

Noter chaque friction dans `DX_FEEDBACK.md`.

## 7. Répétition de démo

Le script de démo (S-035) doit passer deux fois de suite, sans intervention, en moins de 3 minutes. C'est le dernier test avant le gel.
