---
name: api-documentation
description: API documentation with OpenAPI/Swagger, TypeDoc, JSDoc, README structure. Generate spec from code, write reference docs that don't paraphrase the code, examples, error catalog. Use when documenting kryptosphere-api after refonte, writing README for a public package, or defining the API contract before implementation.
---

# Documentation API

## Quand l'utiliser
- Refonte `kryptosphere-api` (sept 2026) : doc API publique obligatoire selon standards.
- Avant d'exposer un endpoint à un consumer externe.
- Onboarding d'un autre dev (membre KS) sur ton API.
- Préparation soutenance PA Actify.

## Méthode

### Niveaux de doc
1. **README** (vue d'ensemble, install, run, contrib).
2. **OpenAPI spec** (contrat API formel).
3. **Reference docs** (TypeDoc / JSDoc générés depuis le code).
4. **Guides** (tutoriels par cas d'usage).
5. **ADR** dans `decisions/log.md` (le pourquoi des choix archi).

Ne pas faire 5 niveaux pour un petit projet. Pour `kryptosphere-api` : README + OpenAPI + ADR.

### OpenAPI 3.x
- Source de vérité = code (préférer génération depuis types Zod/Prisma plutôt qu'écrire le YAML à la main).
- Tools : `zod-to-openapi`, `hono/zod-openapi`, `@asteasolutions/zod-to-openapi`.
- Servir Swagger UI ou Scalar UI sur `/docs` en non-prod (ou avec auth en prod).

### Contenu d'une doc d'endpoint
- **Signature** : méthode + path + types in/out.
- **Intent** (1 ligne) : ce que l'endpoint fait, pour qui.
- **Contrat** :
  - Paramètres (path, query, body) avec types et règles.
  - Headers requis (auth, content-type).
  - Réponses : 2xx (forme), 4xx (codes d'erreur + sémantique), 5xx (cas connus).
- **Exemple** minimal cURL ou TS client.

### README structure type
1. Pitch (1 phrase, ce que c'est).
2. Setup (install + lancer en dev en 3 commandes max).
3. Architecture (lien vers ADR).
4. Tests + lint commands.
5. Déploiement (cible, secrets, runbook).
6. Contrib (style commit, branches).

### TypeDoc / JSDoc
- Pour les libs publiques (`@param`, `@returns`, `@throws`, `@example`).
- Pas pour le code interne — `references/standards.md` dit "Doc API publiques", pas tout le code.

## Standards
- [references/standards.md § Transverse — Doc API](../../../references/standards.md).
- `.claude/rules/05-no-overengineering.md` — pas de doc qui paraphrase le code.

## Anti-patterns
- Doc qui décrit `getFoo()` comme "gets foo".
- OpenAPI YAML divergent du code (toujours générer).
- Pas d'exemple concret.
- Endpoint exposé sans aucune doc.

## Exemples
- `kryptosphere-api` : intégrer `hono/zod-openapi`, exposer `/docs`, doc complète pour 5 endpoints clés.
- README structuré pour le site KS avec section "Sous-domaines" expliquant academy/accelerator.
