# Spec POC : règlement DvP de parts de fonds, instantané ou netté, avec signature Ledger et agents

Date : 10 octobre 2026, mis à jour le 11 octobre 2026. Statut : **périmètre et stack figés**, sauf les points de repli ci-dessous. Périmètre : hackathon Ledger N3XT.

## Objectif

Montrer un cycle complet de souscriptions et rachats de parts d'un fonds, entre trois participants : instructions signées sur Ledger, contrôle de la NAV par un agent, règlement DvP sur testnet dans les deux modes (instantané par ordre, et netting par cycle), avec une attaque refusée en direct.

## Cas d'usage retenu

Un fonds (« Fonds F ») et trois participants : un gérant A, un gérant B et un dépositaire C (banque dépositaire du fonds, qui apporte le cash). Chaque cycle traite les souscriptions et rachats du jour à la NAV publiée, puis les règle : ordre par ordre en mode instantané, ou par soldes nets en mode netting.

Le netting réduit le volume de règlement. Exemple de démo, illustratif et affiché comme tel : 100 M€ de flux bruts deviennent 10 M€ nets.

## Parcours de démo (3 minutes)

1. Le gérant A connecte son Ledger Flex et signe ses règles de mandat (plafond par cycle, fonds autorisés), en texte EIP-191.
2. Les gérants A et B soumettent chacun une instruction : souscription ou rachat, nombre de parts, NAV de référence. Chaque instruction est signée en EIP-712 et affichée en clair sur le Ledger, ou en texte EIP-191 si le repli s'applique.
3. L'agent rapproche la NAV reçue du mock de l'administrateur et signale tout écart ou NAV périmée. Il explique, sans calculer. L'empreinte des entrées et du résultat de la NAV est publiée on-chain.
4. Mode instantané : une instruction isolée est réglée seule, en DvP atomique, dès son exécution.
5. Mode netting : le moteur (code déterministe) calcule les soldes nets du cycle et vérifie la couverture, puis le règlement DvP est exécuté sur Base Sepolia, après approbation sur le Flex de chaque participant concerné.
6. Scène d'injection : une fausse dépêche demande à l'agent de racheter la totalité des parts. Le mandat signé bloque l'opération, et le Ledger n'affiche jamais de transaction.

Les délais instruction → règlement des deux modes sont mesurés et affichés (S-042).

## Périmètre fonctionnel

| Composant | Contenu | Priorité |
|---|---|---|
| Contrats | Token de parts simplifié (liste blanche de participants), mock cash, escrow DvP à deux modes : lot de taille 1 (instantané) ou lot netté (S-042) | P0 |
| Netting | Code déterministe : soldes nets, couverture, racine de Merkle du lot | P0 |
| NAV | Calcul déterministe hors chaîne. Entrées et résultat hachés et publiés (S-041). NAV on-chain et oracle hors POC | P0 |
| Ledger | Connexion DMK, signature EIP-191 des règles, signature EIP-712 des instructions (ou EIP-191 en repli), approbation des règlements, Clear Signing quand couvert | P0 |
| Agents | Rapprochement NAV, contrôle des instructions, explication aux opérateurs. Aucune signature | P0 |
| Web | Tableau de bord : instructions, gross contre net, statut du règlement, bouton de scénario d'attaque | P0 |
| Key Ring | Configuration des participants et clés des agents chiffrées (repli : fichier chiffré local) | P1 |
| Agent Intent | Proposition de transfert de cash vers le compte du participant | P2, roadmap |

## Stack technique (figée)

**Testnet et publication**

- Réseau : Base Sepolia.
- Contrats : Solidity avec Foundry (compilation, tests, déploiement). Tests unitaires et tests de propriétés : la somme des soldes nets est nulle, aucun règlement sans couverture.
- Parts : token ERC-20 simplifié avec liste blanche. ERC-3643 écarté pour le POC.
- Règlement : contrat d'escrow qui détient cash et parts, exécute le DvP en une transaction, et émet la racine de Merkle du lot. Un lot de taille 1 correspond au mode instantané.
- Publication : contrats vérifiés sur l'explorateur de blocs, adresses dans le README.
- Clés : clés de test uniquement, dans des fichiers `.env` exclus du dépôt.

**Ledger**

- DMK (Ethereum Signer Kit, `@ledgerhq/device-signer-kit-ethereum` avec `@ledgerhq/context-module`) via WebHID, Flex et application Ethereum ouverte. Chromium uniquement, en HTTPS ou localhost.
- Trois comptes dérivés sur un seul Flex : `44'/60'/0'/0/0`, `44'/60'/1'/0/0`, `44'/60'/2'/0/0` (recommandation, Q-06).
- Règles : EIP-191, vérifiées côté serveur.
- Instructions : EIP-712 avec Clear Signing si le test est concluant, sinon EIP-191.
- Transactions de règlement et approbations : signées via DMK par le compte concerné. L'agent prépare, un humain approuve sur le Flex (recommandation, Q-07).
- Key Ring via wallet-cli : seul usage de wallet-cli dans ce POC, car il ne gère pas les transactions sur testnet. `ring init` passe par l'app Ledger Sync sur le Flex.

**Autres composants**

- Web : Vite et React, viem pour l'encodage et le décodage. Partir d'un template existant.
- Agents : Node et TypeScript. Le LLM appelle des outils en liste blanche (lecture NAV, positions, création d'instructions en brouillon) et explique. Il ne calcule jamais.
- Netting et NAV : TypeScript en bigint, sans nombres flottants pour les montants. Mêmes invariants que les contrats.
- Mock NAV : petit serveur qui sert un fichier JSON par fonds et par date, avec option de NAV périmée ou fausse pour la démo.
- Stockage : SQLite, ou fichiers JSON pour aller plus vite.
- Hébergement : laptop de la démo, plus une vidéo de secours. Pas de serveur public.
- LLM : `claude-opus-5-5` recommandé, avec une clé de test et un plafond de dépense (Q-01).

## Coûts

Gratuit ou négligeable : Base Sepolia (ETH de test via le faucet Alchemy, limité par jour), vérification des contrats, Foundry, Node, React, Vite, viem, SQLite, hébergement sur laptop, Flex déjà disponible.

LLM : environ 0,02 $ par appel avec `claude-opus-5-5` (tarifs vérifiés le 11 octobre 2026), plafond proposé 50 $ (Q-01). RPC : le RPC public peut suffire.

## Replis

- **Clear Signing EIP-712 non concluant** : signature des instructions en EIP-191 texte, lisible sur le Flex. La démo tient, et le point est noté dans les limites du pitch et dans DX_FEEDBACK.md.
- **wallet-cli non installable, ou app Ledger Sync absente** : Key Ring remplacé par un fichier de configuration chiffré localement, avec une clé dérivée d'une phrase de passe. Signalé comme non final.
- **Agent Intent** : coupé du POC, en roadmap. Sa commande d'envoi ne gère que l'Ethereum mainnet, incompatible avec Base Sepolia.

## Hors périmètre

Régulation, multi-fonds, NAV réelle, NAV on-chain, mainnet, fonds de défaut, novation, intégration avec un client réel, réseau de règlement de production.

## Concurrents à citer dans le pitch

Vérifiés : SIX Digital Exchange (infrastructure complète sur DLT, autorisé en Suisse), Broadridge Distributed Ledger Repo (repo sur DLT, financement), Securitize (émission de produits tokenisés), CACEIS (infrastructure de parts tokenisées pour Amundi et Spiko, cible prioritaire et concurrent potentiel). Ils ne proposent pas, à notre connaissance, un moteur de règlement de parts de fonds à deux modes avec signature Ledger et agents. Formuler avec prudence.

## Ordre d'exécution

Pas de planning daté. L'ordre d'exécution, le chemin critique et les coupes en cas de retard sont dans `stories/README.md`. La première tâche est le test Clear Signing (S-006).

## Règles à respecter

- Code construit à partir de zéro pendant le hackathon, mentionné dans DISCLOSURE.md.
- Le LLM ne produit aucun chiffre ni transaction.
- Chaque action qui ajoute du risque est signée sur le Ledger.
- Le retour d'expérience sur les outils Ledger est consigné dans DX_FEEDBACK.md.

## Questions

Toutes les questions ouvertes du POC sont suivies dans `QUESTIONS.md`.
