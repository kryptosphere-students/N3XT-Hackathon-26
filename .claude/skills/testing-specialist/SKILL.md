---
name: testing-specialist
description: Comprehensive testing strategy — unit, integration, end-to-end. Tools: Vitest, Foundry (Solidity), Playwright. Coverage targets, test pyramid, fixtures, mocks. Use when starting a new project's test suite, designing a testing strategy, debugging flaky tests, or improving coverage on business logic.
---

# Spécialiste Tests

## Quand l'utiliser
- Greenfield : définir la stratégie tests dès le J0.
- Module T3 4AIBC "Tests et Automatisation".
- Code critique sans tests existants (audit + ajout).
- Refonte `kryptosphere-api` : tests d'intégration avant migration.
- Tests flaky à diagnostiquer.

## Méthode

### Pyramide
- **Unit (60-70%)** : pure logic, no I/O. Rapide, ciblé.
- **Integration (20-30%)** : avec DB éphémère, mocks réseaux, fixtures.
- **E2E (5-10%)** : Playwright sur les flows utilisateur critiques (cf. skill `web-app-testing`).

### Outils par stack
- **TS/Node** : Vitest (front + back). Si Jest existant, ne pas migrer sans raison.
- **Solidity** : Foundry (`forge test`) — unit + fuzz + invariants.
- **Smart contracts SmartPy** : `sp.test_scenario`.
- **E2E web** : Playwright.

### Cibles coverage
- Logique métier : ≥ 80%.
- Framework code (boilerplate) : pas de cible.
- Couverture du code de tests lui-même : non.

### Bonnes pratiques
1. **Tests d'intégration > unit** quand la valeur est dans le branchement DB/API.
2. **Fixtures réutilisables**, pas de duplication.
3. **Pas de mock de la DB** sur les tests d'intégration critiques. Préférer `testcontainers` ou une DB éphémère.
4. **Tests déterministes** : pas de `Math.random()`, pas de `Date.now()` sans seed.
5. **Naming** : `<unit>.<scenario>.<expected>` ou Given/When/Then.

### Flaky tests
1. Reproduire avec `--repeat 10`.
2. Suspecter timing (await async, animations, network).
3. Suspecter ordre (shared state entre tests).
4. Isoler le test, ajouter logs, mesurer.

## Standards
- [references/standards.md](../../../references/standards.md) — toutes sections stack.
- Conventional Commits : `test(<scope>): ...` pour les commits de tests.

## Anti-patterns
- Tester l'implémentation au lieu du comportement.
- 100% coverage cible artificiel.
- Mock excessif rendant le test sans valeur.
- Tests qui dépendent les uns des autres.

## Exemples
- T3 4AIBC : suite Vitest + integration testcontainers sur un module auth.
- Foundry tests sur un contrat OpenZeppelin Ownable + fuzz sur les bounds.
