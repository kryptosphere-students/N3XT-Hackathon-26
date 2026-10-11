---
name: database-design
description: Relational and NoSQL database modeling — normalization, indexes, denormalization tradeoffs, Mongo→Postgres migration patterns, schema evolution. Use when designing a new database schema, evaluating data model choices, or planning a database migration (especially Mongo→Postgres for kryptosphere-api).
---

# Conception Base de Données

## Quand l'utiliser
- Greenfield : design schema initial.
- Refonte `kryptosphere-api` : design cible Postgres depuis modèle Mongo existant.
- Évaluation : faut-il dénormaliser, ajouter un index, faire une vue matérialisée ?
- Évolution : ajout de colonne, breaking change.

## Méthode

### Démarrer
1. Inventorier les **entités métier** (User, Event, Sponsor, ...).
2. Identifier les **relations** : 1-1, 1-N, N-N (table de jonction).
3. Définir les **clés** : ID interne (auto/UUID), clés naturelles (email unique), composées.
4. Lister les **requêtes types** (read-heavy ? write-heavy ? agrégations ?).
5. Choisir : relationnel par défaut, NoSQL si schema-less justifié (logs, sessions, cache).

### Normalisation
- Démarrer en 3NF.
- Dénormaliser **seulement** si requête mesurée trop lente OU contrainte de cohérence forte (snapshot historique).
- Documenter chaque dénormalisation (pourquoi, quelle requête).

### Indexes
- Sur toute FK.
- Sur colonnes de `WHERE` fréquent.
- Index composite si filtre multi-colonne récurrent.
- `EXPLAIN ANALYZE` avant + après.
- Pas d'index spéculatif.

### Migration Mongo → Postgres (cas kryptosphere-api)
1. **Inventaire** des collections Mongo + leurs schémas réels (introspect via Mongoose models).
2. **Mapping** collection → table(s). Embedded docs Mongo → table séparée + FK le plus souvent.
3. **Types** : `_id` (ObjectId) → `id` (UUID ou cuid). Dates BSON → `timestamptz`.
4. **Script de migration** idempotent : read Mongo → transform → upsert Postgres.
5. **Phase double-write** : application écrit sur les 2 DBs, lit Postgres (avec fallback Mongo).
6. **Switch read** : 100% Postgres.
7. **Cutover** : arrêt writes Mongo.

## Standards
- [references/standards.md](../../../references/standards.md).
- [SOP Refonte technique](../../../references/sops/refonte-technique.md).

## Anti-patterns
- Stocker du JSON dans Postgres alors qu'on peut normaliser (sauf cas valide : config, metadata floues).
- Pas d'index sur FK.
- Migrations destructives en prod sans backup.
- ObjectId Mongo recyclé en string non typé en Postgres.

## Exemples
- Design schema KS : Event, Sponsor, Sponsoring (N-N avec montant historisé).
- Décider : embedded docs vs séparée pour les "tags" d'un event ?
