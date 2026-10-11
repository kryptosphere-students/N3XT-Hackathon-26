---
name: cicd-pipeline
description: CI/CD pipelines with GitHub Actions and GitLab CI — lint, test, build, deploy stages, caching, secrets, matrix builds, Vercel integration. Use when setting up CI for kryptosphere-website or kryptosphere-api, adding automated checks before merge, or debugging pipeline failures.
---

# Pipeline CI/CD

## Quand l'utiliser
- Ajouter CI sur `kryptosphere-website` ou `kryptosphere-api`.
- Bloquer les PRs cassées avant merge (lint, tests, type check).
- Setup déploiement automatique vers Vercel.
- Audit sécu CI (deps, secrets).

## Méthode

### GitHub Actions — squelette Node project
```
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

### Stages recommandés (ordre)
1. **Install** (cache deps).
2. **Lint** (rapide, fail fast).
3. **Typecheck** (`tsc --noEmit`).
4. **Unit + integration tests**.
5. **Build**.
6. **E2E** (Playwright, optionnel selon coût).
7. **Audit sécu** (`npm audit --audit-level=moderate`).
8. **Deploy** (sur push main uniquement).

### Cache
- `actions/setup-node` avec `cache: pnpm|npm|yarn`.
- Cache Playwright browsers : `~/.cache/ms-playwright`.

### Secrets
- Jamais dans le code.
- GitHub Settings → Secrets and variables → Actions.
- Env vars : `${{ secrets.DATABASE_URL }}`.
- **Ne JAMAIS** logger `secrets.*`.

### Vercel
- Auto-deploy via Vercel GitHub App (pas besoin de step deploy custom).
- Preview deploy par PR : par défaut activé.
- Garder les checks GitHub Actions comme garde-fou avant que Vercel build.

### Matrix builds (si stack multiple)
```
strategy:
  matrix:
    node: [20, 22]
    os: [ubuntu-latest]
```

### Branch protection
- Sur `main` : exiger PR review + checks CI verts.

## Standards
- [references/standards.md § Transverse](../../../references/standards.md).
- [SOP Audit pré-release](../../../references/sops/audit-prerelease.md).

## Anti-patterns
- Workflow qui re-installe les deps à chaque step.
- Tests qui se passent en CI mais pas en local (env divergent).
- Deploy sans build step.
- Secrets en clair dans `if: ${{ secrets.X == 'true' }}`.

## Exemples
- `kryptosphere-website` : CI lint + typecheck + build + Vercel preview.
- `kryptosphere-api` post-refonte : CI complet + tests intégration testcontainers + audit deps.
