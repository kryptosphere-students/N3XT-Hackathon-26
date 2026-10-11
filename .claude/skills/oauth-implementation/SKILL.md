---
name: oauth-implementation
description: Implement OAuth 2.0 and OpenID Connect flows correctly — authorization code with PKCE, refresh token rotation, JWT vs session cookies, RBAC. Use when adding authentication to an app, implementing SSO, working on the T3 4AIBC "Protocole Authentification" module, or auditing existing auth code.
---

# Implémentation OAuth

## Quand l'utiliser
- T3 4AIBC : module Protocole Authentification.
- Ajout d'auth à une nouvelle app (site KS, sous-domaines `academy.*` / `accelerator.*`).
- Migration depuis une auth maison ou legacy.
- Audit d'une implémentation OAuth existante.

## Méthode

### Choisir le flow
- **Web app server-rendered** : Authorization Code + PKCE + httpOnly cookies.
- **SPA (cas kryptosphere-website)** : Authorization Code + PKCE → backend qui pose un cookie httpOnly. **Pas de JWT en localStorage**.
- **Mobile / native** : Authorization Code + PKCE.
- **Machine-to-machine** : Client Credentials.
- **Implicit Flow** : déprécié. Ne plus utiliser.

### Tokens
- **Access token** : court (15 min), JWT signé (RS256 ou ES256, pas HS256 partagé).
- **Refresh token** : long (jours/semaines), **rotation à chaque usage**, stocké côté serveur si possible.
- **ID token** (OIDC) : claims utilisateur, pas pour l'autorisation API.

### Stockage côté client
- ✅ Cookie `httpOnly` + `Secure` + `SameSite=Strict` (idéalement Lax si cross-site nécessaire).
- ❌ `localStorage` / `sessionStorage` : exposé à l'XSS.
- ❌ JWT lisible côté JS pour autorisation : tu peux le décoder pour affichage UI, mais l'autorisation vit côté serveur.

### Sécurité critique
1. **PKCE obligatoire** sur clients publics.
2. **State** parameter contre CSRF.
3. **Nonce** pour OIDC.
4. **Redirect URIs** allowlistées strictement.
5. **CORS** strict (pas de `*` sur les endpoints auth).
6. **Rate limiting** sur `/token`, `/login`.
7. **Validation signature JWT** côté ressource serveur (pas seulement décodage).
8. **Révocation** : endpoint de logout qui invalide refresh token côté serveur.

### Providers
- Pour KS : envisager **Auth.js (NextAuth)** si Next, **Lucia** si custom contrôle, **Clerk/Supabase Auth** si SaaS rapide.
- Pour PA Actify : selon contrainte académique (cahier des charges).

## Standards
- [references/standards.md § TS/Node — Sécurité](../../../references/standards.md).
- Aligné avec `.claude/rules/03-code-quality-strict.md` (OWASP).

## Anti-patterns
- JWT en localStorage (cf. test du push-back que Claude doit faire).
- HS256 avec secret partagé entre clients.
- Refresh token sans rotation.
- `state` absent.
- Décodage JWT côté client pour autorisation.

## Exemples
- T3 4AIBC : implémenter Authorization Code + PKCE entre une SPA et un backend Node.
- Site KS : ajouter login Google/GitHub via Auth.js avec cookie httpOnly.
