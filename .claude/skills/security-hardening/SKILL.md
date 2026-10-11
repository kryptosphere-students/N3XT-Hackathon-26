---
name: security-hardening
description: Web application security hardening — OWASP Top 10, security headers, input validation, dependency audit, secrets management, CSP. Use when auditing security of an app before release, hardening a public deployment (kryptosphere-website), responding to a vulnerability report, or before adding sensitive features.
---

# Durcissement Sécurité

## Quand l'utiliser
- Audit pré-release (cf. [SOP Audit pré-release](../../../references/sops/audit-prerelease.md)).
- Hardening site KS / API KS avant pics d'audience (events, hackathons).
- Réponse à une vulnérabilité signalée.
- Avant d'ajouter une feature sensible (auth, paiement, upload, admin).

## Méthode

### OWASP Top 10 (2021) — checklist
1. **Broken Access Control** — RBAC explicite, deny by default. Tester accès cross-user.
2. **Cryptographic Failures** — TLS partout, secrets via env, hash bcrypt/argon2 pour passwords.
3. **Injection** — paramétrisation SQL (Prisma le fait), validation Zod sur tous les inputs.
4. **Insecure Design** — threat modeling avant gros features.
5. **Security Misconfiguration** — désactiver les défauts dangereux, headers HTTP corrects.
6. **Vulnerable Components** — `npm audit`, Dependabot/Renovate.
7. **Identification & Authentication Failures** — cf. skill `oauth-implementation`.
8. **Software & Data Integrity Failures** — SRI sur CDN, signatures sur artefacts CI.
9. **Logging & Monitoring Failures** — logs structurés, alertes sur 5xx anormales.
10. **SSRF** — allowlist d'URL outbound, jamais d'URL utilisateur direct dans `fetch`.

### Headers HTTP indispensables
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...   (à composer précisément)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Helmet (Node) configure la plupart par défaut.

### Secrets
- `.env` jamais commité (cf. `.gitignore`).
- Production : variables d'env Vercel/IONOS.
- Audit du repo Git pour leaks accidentels : `gitleaks` ou `trufflehog`.
- Rotation périodique.

### Audit de dépendances
- `npm audit --audit-level=moderate` en CI, bloquant.
- Renovate ou Dependabot configuré.

### Spécifique Web3 (si applicable)
- Cf. [references/standards.md § Solidity](../../../references/standards.md).
- Slither + Mythril + Foundry tests + Checks-Effects-Interactions.
- Pas d'`tx.origin` pour auth.

## Standards
- [references/standards.md](../../../references/standards.md).
- `.claude/rules/03-code-quality-strict.md`.

## Anti-patterns
- "On audite après release."
- Secrets en clair dans le code "temporairement".
- CSP `unsafe-inline` permanent.
- Pas de rate limiting sur endpoints sensibles.

## Exemples
- Audit complet `kryptosphere-website` avant un event majeur : headers, deps, CSP, secrets leakés.
- Hardening `kryptosphere-api` post-refonte Neon : input validation, rate limit, audit logs.
