---
name: prisma-orm
description: Expert patterns for Prisma ORM with Postgres (especially Neon serverless) — schema design, migrations, connection pooling, query optimization, edge runtime compat. Use when designing data models, writing migrations, optimizing queries, or setting up Prisma for Neon/Vercel deployment.
---

# Prisma ORM

## Quand l'utiliser
- Conception du schéma data (refonte `kryptosphere-api` Mongo → Neon/Postgres).
- Écriture/évolution de migrations.
- Setup Prisma + Neon (connection pooling, edge runtime).
- Optimisation requêtes N+1, select trop large.

## Méthode

### Setup Neon + Prisma
1. **Deux connection strings** :
   - `DATABASE_URL` : pooled (port 6543 ou Neon pooler) pour runtime applicatif.
   - `DIRECT_URL` : direct (port 5432) pour migrations seulement.
2. `schema.prisma` :
   ```
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
3. `prisma generate` après chaque modif de schema.
4. Migrations : `prisma migrate dev` en dev, `prisma migrate deploy` en CI/prod.

### Schema design
- Pluriel pour tables (convention Postgres) : `@@map("users")`.
- `cuid()` ou `uuid()` pour IDs publics (jamais d'autoincrement exposé).
- Relations explicites : `@relation(fields: [authorId], references: [id])`.
- Index sur clés étrangères et colonnes de filtre fréquent.
- `@updatedAt`, `@default(now())` pour timestamps.

### Requêtes
- `select` précis (jamais `*` implicite) pour limiter le payload.
- `include` raisonné (attention N+1).
- Transactions explicites pour les flux multi-tables.
- `prisma.$transaction([...])` pour batch.

### Edge runtime (si Vercel Edge)
- Prisma Accelerate ou Neon HTTP driver (pas de TCP en edge).
- `@prisma/adapter-neon` + `@neondatabase/serverless`.

## Standards
- [references/standards.md § TypeScript / Node](../../../references/standards.md).
- Pas de magic numbers dans les migrations.
- Migrations commit-ées, jamais éditées rétroactivement.

## Anti-patterns
- `DATABASE_URL` directe (non-pooled) en runtime → épuise les connexions Neon.
- Migrations modifiées après merge.
- `findMany()` sans `take`/`select`.

## Exemples
- Migration Mongo → Postgres : design schema relationnel équivalent, script d'export Mongo + import Prisma.
- Setup edge function Vercel avec Prisma + Neon HTTP driver.
