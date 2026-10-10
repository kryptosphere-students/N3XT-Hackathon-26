# Spec POC : netting pré-financé de parts de fonds avec signature Ledger et agents

Date : 10 octobre 2026. Statut : **périmètre et stack figés**, sauf les deux points de repli ci-dessous. Périmètre : hackathon Ledger N3XT, démo le vendredi 16 octobre.

## Objectif

Montrer un cycle complet de souscriptions et rachats de parts d'un fonds, entre trois participants : instructions signées sur Ledger, contrôle de la NAV par un agent, netting et règlement DvP sur testnet, avec une attaque refusée en direct.

## Cas d'usage retenu

Un fonds (« Fonds F ») et trois participants : un gérant A, un gérant B et un dépositaire C qui apporte du cash. Chaque cycle compense les souscriptions et rachats du jour à la NAV publiée, puis règle les soldes nets.

Le netting réduit le volume de règlement. Exemple de démo, à titre illustratif : 100 M€ de flux bruts deviennent 10 M€ nets, affichés côte à côte.

## Parcours de démo (3 minutes)

1. Le gérant A connecte son Ledger Flex et signe ses règles de mandat (plafond par cycle, fonds autorisés), en texte EIP-191.
2. Les gérants A et B soumettent chacun une instruction : souscription ou rachat, nombre de parts, NAV de référence. Chaque instruction est signée en EIP-712 et affichée en clair sur le Ledger, ou en texte EIP-191 si le repli s'applique.
3. L'agent rapproche la NAV reçue du mock de l'administrateur et signale tout écart ou NAV périmée. Il explique, sans calculer.
4. Le moteur de netting (code déterministe) calcule les soldes nets par participant et vérifie la couverture préfinancée.
5. Le règlement DvP est exécuté on-chain : parts contre cash, de manière atomique, sur Base Sepolia.
6. Scène d'injection : une fausse dépêche demande à l'agent de racheter la totalité des parts. Le mandat signé bloque l'opération, et le Ledger n'affiche jamais de transaction.

## Périmètre fonctionnel

| Composant | Contenu | Priorité |
|---|---|---|
| Contrats | Token de parts simplifié (liste blanche de participants), mock cash, escrow DvP avec préfinancement | P0 |
| Netting | Code déterministe : soldes nets, couverture, racine de Merkle du lot | P0 |
| Ledger | Connexion DMK, signature EIP-191 des règles, signature EIP-712 des instructions (ou EIP-191 en repli), Clear Signing quand couvert | P0 |
| Agents | Rapprochement NAV, contrôle des instructions, explication aux opérateurs | P0 |
| Web | Tableau de bord : instructions, gross vs net, statut du règlement, bouton de scénario d'attaque | P0 |
| Key Ring | Configuration des participants et clés des agents chiffrées (repli : fichier chiffré local) | P1 |
| Agent Intent | Proposition de transfert de cash vers le compte du participant | P2, roadmap |

## Stack technique (figée)

**Testnet et publication**

- Réseau : Base Sepolia.
- Contrats : Solidity avec Foundry (compilation, tests, déploiement). Tests unitaires et tests de propriétés : la somme des soldes nets est nulle, aucun règlement sans couverture.
- Parts : token ERC-20 simplifié avec liste blanche. ERC-3643 écarté pour le POC.
- Règlement : contrat d'escrow qui détient cash et parts, exécute le DvP en une transaction, et émet la racine de Merkle du lot.
- Publication : contrats vérifiés sur l'explorateur de blocs, adresses dans le README.
- Clés : clés de test uniquement, dans des fichiers `.env` exclus du dépôt.

**Ledger**

- DMK (Ethereum Signer Kit, dmk-ts) via WebHID, Flex et application Ethereum ouverte.
- Règles : EIP-191, vérifiées côté serveur.
- Instructions : EIP-712 avec Clear Signing si le test est concluant, sinon EIP-191.
- Transactions de règlement et approbations : DMK, Clear Signing pour les transferts ERC-20 couverts.
- Key Ring via wallet-cli, sous réserve d'installation sur les postes de l'équipe.

**Autres composants**

- Web : Vite et React, viem pour l'encodage et le décodage. Partir d'un template existant.
- Agents : Node et TypeScript. Le LLM appelle des outils (lecture NAV, positions, création d'instructions) et explique. Il ne calcule jamais.
- Netting : TypeScript en bigint, sans nombres flottants pour les montants. Mêmes invariants que les contrats.
- Mock NAV : petit serveur qui sert un fichier JSON par fonds et par date, avec option de NAV périmée ou fausse pour la démo.
- Stockage : SQLite, ou fichiers JSON pour aller plus vite.
- Hébergement : laptop de la démo, plus une vidéo de secours. Pas de serveur public.
- LLM : tout modèle capable d'appels d'outils, avec une clé de test et un plafond de dépense.

## Coûts

Gratuit ou négligeable : Base Sepolia (ETH de test via faucets, parfois limités par jour), vérification des contrats, Foundry, Node, React, Vite, viem, SQLite, hébergement sur laptop, Flex déjà disponible.

À vérifier : le LLM (facturé à l'usage, principal coût, plafond à fixer), un RPC privé (plan gratuit à vérifier, le RPC public peut suffire), et les conditions d'utilisation de DMK et wallet-cli. Tarifs non vérifiés en ligne.

## Replis

- **Clear Signing EIP-712 non concluant** : signature des instructions en EIP-191 texte, lisible sur le Flex. La démo tient, et le point est noté dans les limites du pitch et dans DX_FEEDBACK.md.
- **wallet-cli non installable** : Key Ring remplacé par un fichier de configuration chiffré localement, avec une clé dérivée d'une phrase de passe. Signalé comme non final.
- **Agent Intent** : coupé du POC, en roadmap.

## Hors périmètre

Régulation, multi-fonds, NAV réelle, mainnet, fonds de défaut, novation, intégration avec un CSD réel, réseau de règlement de production.

## Concurrents à citer dans le pitch

Vérifiés : SIX Digital Exchange (infrastructure complète sur DLT, autorisé en Suisse), Broadridge Distributed Ledger Repo (repo sur DLT, financement), Securitize (émission de produits tokenisés). Ils ne proposent pas, à notre connaissance, un moteur de netting pré-financé de parts de fonds avec signature Ledger et agents. Formuler avec prudence.

## Planning

| Jour | Ingénierie | Business |
|---|---|---|
| Sam 10 - Dim 11 | Contrats et tests, netting, mock NAV | Scénario de démo, pitch |
| Lun 12 - Mar 13 | Test Clear Signing et wallet-cli en premier, puis DMK et signatures, agents, tableau de bord, injection | Vidéo, README |
| Mer 14 - Jeu 15 | Stabilisation, répétitions | Slides |
| Ven 16 | Pitch | |

Gel des fonctionnalités : mardi 13 à 14h. Le planning précédent était calé sur le POC BTC et doit être recalé.

## Règles à respecter

- Code construit à partir de zéro pendant le hackathon, mentionné dans DISCLOSURE.md.
- Le LLM ne produit aucun chiffre ni transaction.
- Chaque action qui ajoute du risque est signée sur le Ledger.
- Le retour d'expérience sur les outils Ledger est consigné dans DX_FEEDBACK.md.

## Questions restantes

Bloquantes, à trancher avant lundi :

1. **Soumission** : le POC remplace-t-il le copilote BTC, ou les deux coexistent-ils ? Qui décide, et qui l'enregistre dans DECISIONS.md ?
2. **Appareils Ledger** : un seul Flex pilote-t-il les trois comptes (recommandé pour la démo), ou faut-il un second Flex pour le gérant B ?
3. **Règles du hackathon** : vérifier qu'un nouveau projet, né après le 7 octobre, est accepté dans le cadre de l'événement, et si le dépôt BTC existant doit rester visible.

Non bloquantes, à traiter pendant le développement :

4. Quel fournisseur de LLM, avec quel plafond de dépense ?
5. Les faucets Base Sepolia fournissent-ils assez d'ETH de test pour toute l'équipe ?
6. Les conditions d'utilisation de DMK et wallet-cli permettent-elles la démonstration publique ?
7. Les chiffres de l'exemple (100 M€ / 10 M€) sont-ils acceptables dans le pitch, ou faut-il les présenter comme simulés ?
