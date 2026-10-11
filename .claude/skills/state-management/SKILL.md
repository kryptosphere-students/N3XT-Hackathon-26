---
name: state-management
description: State management patterns for React — server state with React Query, client state with Zustand/Jotai, form state with React Hook Form, URL state, when not to use Redux. Use when choosing a state library, refactoring tangled state, splitting server vs client state, or debugging stale data issues.
---

# Gestion d'État

## Quand l'utiliser
- Nouveau projet React → choisir la stack state.
- Refactor d'un composant avec props drilling profond ou state dispersé.
- Bug de "stale data" ou de cache invalide.
- `kryptosphere-website` ou sous-domaines `academy.*` / `accelerator.*`.

## Méthode

### Taxonomie du state
1. **Server state** (données distantes, async) → **React Query** (déjà dans `kryptosphere-website`).
2. **Client state global** (UI, préférences user, theme) → **Zustand** (ou Jotai).
3. **Form state** → **React Hook Form** (+ Zod) — déjà dans le site KS.
4. **URL state** (filtres, pagination, onglets) → `useSearchParams` / `react-router-dom` (déjà installé).
5. **Local component state** → `useState` / `useReducer`.

Ne pas mélanger : 1 source de vérité par catégorie.

### React Query (cas usage principal Yohan)
- **Query keys** structurées : `['events', { eventId, filters }]`.
- **Stale time** explicite (jamais default si tu sais).
- **Invalidations** ciblées après mutation.
- **Optimistic updates** quand UX critique.
- `select` pour transformer la donnée sans changer la query key.
- `enabled` pour les queries conditionnelles.

### Zustand
- Stores petits et ciblés (1 store par domaine, pas 1 store global).
- `immer` middleware pour mutations naturelles.
- `persist` middleware pour user prefs (localStorage **non sensible**, jamais de token).
- Sélecteurs pour éviter re-renders inutiles.

### Redux
- Pas par défaut. Utiliser **seulement** si :
  - Time-travel debugging vraiment nécessaire.
  - Codebase legacy déjà en Redux.
  - Équipe demande explicitement.

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- Ne pas stocker de JWT ni de secret en client state (Zustand persist inclus). Cf. règle sécu.

## Anti-patterns
- Mettre tout dans React Context "parce que c'est natif".
- Sync server state vers Zustand manuellement (double source de vérité).
- `useState` + `useEffect` pour fetch (réinventer React Query mal).
- Store Redux pour une todo-list.

## Exemples
- `kryptosphere-website` : isoler la query `useEvents` avec stale time + invalidation après création.
- Sous-domaine `accelerator.*` : Zustand store pour l'état du wizard d'inscription, séparé des données API.
