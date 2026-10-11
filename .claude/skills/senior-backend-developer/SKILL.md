---
name: senior-backend-developer
description: Build scalable Node.js + TypeScript backend systems with PostgreSQL, framework choice (Express, Fastify, Hono, NestJS), authentication, error handling, observability. Use when designing or refactoring backend APIs, choosing HTTP framework, working on kryptosphere-api Mongo→Neon migration, or implementing auth flows.
---

# Développeur Backend Senior

## Quand l'utiliser
- Conception ou refactoring d'API HTTP (Node + TS).
- Choix de framework (Express vs Fastify vs Hono vs NestJS).
- Refonte `kryptosphere-api` (Mongo → Neon/Postgres, sept 2026).
- Architecture data + auth + observability.

## Méthode

### Choix de framework
- **Hono** : edge-first, ultra-léger, idéal Vercel/Cloudflare. Recommandé pour API KS si déployée sur Vercel.
- **Fastify** : Node classique, performant, écosystème mature.
- **Express** : legacy, encore OK pour migration mais pas pour greenfield.
- **NestJS** : si besoin d'opinion forte et structure DI lourde (rare en asso).

### Squelette nouveau projet
1. `pnpm init` + `tsconfig.json` strict + ESLint.
2. Framework HTTP choisi + Zod pour validation inputs.
3. ORM (cf. `prisma-orm` skill) si Postgres.
4. Tests (Vitest + intégration avec testcontainers ou DB éphémère).
5. Dotenv pour env vars (jamais committed).
6. Logging structuré (Pino).
7. Healthcheck endpoint.

### Architecture
- **Layered** : routes → services → repositories. Pas de Mongoose dans les routes.
- **Erreurs typées** : classes ou discriminated unions. Renvoyer 4xx/5xx mappés.
- **Pas de try/catch défensif** — let it crash si l'erreur n'est pas attendue, et un middleware global la mappe en 500.

### Sécurité
- Helmet (headers HTTP).
- Rate limiting.
- Validation Zod sur TOUT input externe.
- CORS strict.
- Cookies httpOnly + Secure + SameSite=Strict pour les sessions/JWT (cf. skill `oauth-implementation`).

## Standards
- [references/standards.md § TypeScript / Node](../../../references/standards.md).
- [SOP Refonte technique](../../../references/sops/refonte-technique.md) pour la migration API KS.

## Anti-patterns
- ORM/driver dans les controllers.
- Try/catch enrobant tout.
- Secrets dans le code.
- Pas de tests d'intégration sur les flows métier critiques.

## Exemples
- Refactor `kryptosphere-api` : choisir Hono, ajouter Prisma + Postgres, valider toutes routes avec Zod.
- Ajouter un endpoint authentifié avec rate limiting + audit log.
