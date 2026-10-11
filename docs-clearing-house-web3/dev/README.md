# Guide développeur — POC clearing house web3

Point d'entrée pour coder le POC. Le produit est décrit dans `../spec-poc.md`, le backlog dans `../stories/`.

## Démarrer en 30 minutes

1. **Comprendre ce qu'on construit** (5 min) : lire `../spec-poc.md`, sections Objectif et Parcours de démo.
2. **Installer la machine** : [SETUP.md](SETUP.md), section 1.
3. **Récupérer les accès** : [API-CONNECTEURS.md](API-CONNECTEURS.md), section 1.
4. **Remplir le `.env`** : copier `clearing-house-web3/.env.example` vers `clearing-house-web3/.env`, puis suivre [PLACEHOLDERS.md](PLACEHOLDERS.md).
5. **Initialiser le monorepo** si ce n'est pas encore fait (S-043) : [SETUP.md](SETUP.md), section 3. Sinon, `npm install` à la racine de `clearing-house-web3/`.
6. **Vérifier que tout passe** : [TESTS.md](TESTS.md).
7. **Prendre une story** : [PLAN-DEV.md](PLAN-DEV.md), puis la fiche dans `../stories/`.

## Contenu du guide

| Fichier | Contenu |
|---|---|
| [SETUP.md](SETUP.md) | Outils à installer, versions des paquets, commandes d'initialisation, commandes de développement |
| [ARBORESCENCE.md](ARBORESCENCE.md) | Arborescence du code, rôle de chaque dossier, fichier par story |
| [PLACEHOLDERS.md](PLACEHOLDERS.md) | Variables d'environnement, constantes à figer, valeurs produites pendant le développement |
| [API-CONNECTEURS.md](API-CONNECTEURS.md) | Comptes et clés à obtenir, connecteurs Ledger, contrats d'interface entre modules |
| [TESTS.md](TESTS.md) | Commandes de test, de lint et de vérification, tests manuels sur le Flex |
| [PLAN-DEV.md](PLAN-DEV.md) | Répartition en deux flux, jalons, ordre des stories, points d'intégration |

## Règles qui s'appliquent au code

- **Le LLM ne calcule rien et ne signe rien.** NAV, netting, couverture et transactions viennent du code déterministe.
- **Chaque action qui ajoute du risque est signée sur le Flex.** Le serveur rejette tout ordre ou règle non signé.
- **Aucun secret dans le dépôt.** Clés de test uniquement, dans `.env`. Le mot de passe Key Ring reste dans le trousseau du système.
- **Montants en `bigint`**, jamais en nombre flottant.
- **Chemins de dérivation en constantes**, sans préfixe `m/`.
- **Conventional Commits**, une branche par story (`feat/S-011-escrow`), lint sans warning.
- Claude Code ne commite pas et ne pousse pas : c'est l'équipe qui le fait.

Règles complètes : dans la configuration Claude Code locale (hors dépôt).

## Utiliser les skills Claude Code du projet

Les dossiers `.claude/` et `ledger-hackathon-docs/` (brief, règles, skills Ledger) restent en local et sont exclus du dépôt (`.gitignore`). Demander une copie à l'équipe.
