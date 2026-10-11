---
name: web-app-testing
description: End-to-end web app testing with Playwright — page object model, fixtures, parallel execution, screenshots, network mocking, CI integration, visual regression. Use when adding E2E coverage to kryptosphere-website, debugging flaky E2E tests, or setting up Playwright in a new project.
---

# Tests d'Applications Web (Playwright)

## Quand l'utiliser
- Ajouter une suite E2E à `kryptosphere-website`.
- Tester des flows critiques : inscription event, contact sponsor, navigation principale.
- Reproduire un bug user via test.
- Module T3 4AIBC "Tests et Automatisation" (volet E2E).

## Méthode

### Setup minimal
1. `pnpm add -D @playwright/test`.
2. `pnpm playwright install chromium` (au moins ; firefox/webkit selon besoin).
3. `playwright.config.ts` :
   - `testDir: 'tests/e2e'`
   - `reporter: [['html'], ['list']]`
   - `use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' }`
   - Projects : chromium par défaut, multi-browser en CI.
4. Script package.json : `"test:e2e": "playwright test"`.

### Architecture
- **Page Object Model** pour pages > 3 tests : `tests/e2e/pages/HomePage.ts`.
- **Fixtures** pour data setup réutilisable (`tests/e2e/fixtures/`).
- **Test isolation** : pas d'état partagé entre tests par défaut.

### Bonnes pratiques
- **Locators sémantiques** : `getByRole`, `getByLabel`, `getByText` > CSS selectors.
- **Auto-wait** intégré Playwright — pas de `waitForTimeout` arbitraire.
- **Screenshots on failure** automatique via config.
- **Network mocking** : `page.route()` pour mocker l'API en test.
- **Visual regression** : `expect(page).toHaveScreenshot()` pour les pages critiques.

### CI
- GitHub Actions matrix (chromium / firefox / webkit).
- Artifact upload : report HTML + traces sur fail.
- Sharding pour suite > 30s : `--shard=1/4`.

### Flaky tests
1. Activer `trace: 'on'` localement, voir la trace.
2. Vérifier les race conditions (animations, requêtes en vol).
3. Préférer `await expect(locator).toBeVisible()` à `await locator.waitFor()`.
4. Si retry obligatoire : `retries: 2` en CI uniquement, **jamais en local** (cache le bug).

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- [SOP Audit pré-release](../../../references/sops/audit-prerelease.md).

## Anti-patterns
- Tester l'implémentation (sélecteurs CSS fragiles).
- `page.waitForTimeout(5000)` au lieu d'auto-wait.
- État partagé via globals entre tests.
- Trop de mocks : un test E2E qui ne touche pas le vrai backend devient un test d'intégration déguisé.

## Exemples
- Suite E2E pour le formulaire de contact sponsor (`kryptosphere-website`).
- Test visual regression sur la home page avant un event majeur.
