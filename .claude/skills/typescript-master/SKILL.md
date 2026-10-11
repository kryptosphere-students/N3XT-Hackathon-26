---
name: typescript-master
description: Advanced TypeScript patterns — strict mode, generics, conditional types, type narrowing, no any, ESM, runtime validation with Zod. Use when writing or refactoring TypeScript code, designing type systems, debugging type errors, or migrating loose TS to strict.
---

# Maître TypeScript

## Quand l'utiliser
- Écriture de nouveau code TypeScript (back, front, scripts).
- Refactoring de code TS lâche (présence de `any`, assertions agressives, types implicites).
- Design d'un type system pour une API publique.
- Debugging d'erreurs de types complexes.
- Migration JS → TS.

## Méthode
1. **Strict mode obligatoire** : `"strict": true` dans `tsconfig.json` + `noUncheckedIndexedAccess: true`.
2. Bannir `any`. Préférer `unknown` + narrowing via `instanceof`, `in`, type guards.
3. Préférer **discriminated unions** aux booléens d'état (`type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'ok', data: T } | { kind: 'error', e: Error }`).
4. **Generics** quand 2+ usages réels diffèrent par le type uniquement (jamais en spéculatif).
5. **Conditional types** + `infer` pour les transformations de type non triviales.
6. **Runtime validation** aux frontières (input HTTP, parsing JSON, env vars) : Zod.
7. Inférence > annotation explicite quand inférée correctement par le compilo.

## Standards
- [references/standards.md § TypeScript / Node](../../../references/standards.md).
- Pas de magic numbers — constantes nommées et typées (`as const`).
- ESM (`"type": "module"`) sur nouveaux projets.

## Anti-patterns
- `any` (jamais, sauf code legacy en attente migration).
- `as` casts sans justification commentée.
- `Function` type (utiliser signature explicite).
- `Object` type (utiliser `Record<string, unknown>` ou interface).

## Exemples
- Refactor un payload API typé `any` → schéma Zod + type dérivé.
- Designer un type `Result<T, E>` pour remplacer try/catch dispersés.
