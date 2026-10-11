---
name: react-best-practices
description: Modern React patterns and optimization — hooks discipline, composition, controlled vs uncontrolled, key strategy, re-render minimization, suspense, error boundaries. Use when reviewing React code, refactoring components in kryptosphere-website, debugging unnecessary re-renders, or onboarding a new feature.
---

# Bonnes Pratiques React

## Quand l'utiliser
- Code review de composants React.
- Refactoring composants `kryptosphere-website` (Vite + React 18 + shadcn/ui).
- Debug re-renders excessifs (mesure DevTools profiler).
- Nouvelle feature avec interactions complexes.

## Méthode

### Structure
- 1 composant = 1 fichier. PascalCase pour le fichier + l'export.
- Hooks custom dans `useXxx.ts`.
- Pas de logique métier dans les composants — extraire en hooks / services.
- Pas de mega-composants : si > ~150 lignes, splitter.

### Hooks discipline
- **Règles** : appel au top-level, pas conditionnel, pas dans une boucle.
- `useEffect` réservé aux side-effects vrais (subscribe, fetch, DOM imperatif). **PAS pour dériver du state** — utiliser `useMemo` ou calcul inline.
- `useCallback` / `useMemo` seulement quand mesure prouve un gain (cf. re-render profiler).
- `useState` initializer function (`() => expensiveInit()`) pour calcul coûteux.

### Composition > héritage > props drilling profond
- Composition via `children` ou render props.
- `Context` pour props partagées profondes (theme, auth user). Pas pour state qui change souvent (perf).
- Lever le state au plus bas dénominateur commun, pas plus haut.

### Re-renders
1. Mesurer avec React DevTools Profiler avant d'optimiser.
2. `React.memo` sur composants reçus en children stables.
3. Diviser le state : éviter qu'un changement déclenche un re-render d'un sous-arbre indépendant.

### Server Components (si Next.js — pas le cas kryptosphere-website)
- Server par défaut, `'use client'` seulement quand nécessaire (interactivité, hooks).

### shadcn/ui (cas kryptosphere-website)
- Composants copiés dans `src/components/ui/` — ne pas modifier en place, **étendre par composition**.
- Variants via `class-variance-authority` (déjà installé).

### Forms
- `react-hook-form` + Zod (déjà la stack du site KS).
- Validation côté client + côté serveur.

## Standards
- [references/standards.md § Next.js/React + Vite+React](../../../references/standards.md).

## Anti-patterns
- `useEffect([])` pour fetch sans cleanup ni gestion des race conditions.
- State dérivé stocké en `useState` au lieu de calculé.
- `React.memo` partout "par sécurité".
- Mutation directe d'objets en state (`state.foo = 1`).
- `index` comme `key` pour des listes dynamiques.

## Exemples
- Refactor un composant qui re-render à chaque keystroke d'un input non lié.
- Extraire un hook `useEventForm` réutilisable depuis un composant page.
