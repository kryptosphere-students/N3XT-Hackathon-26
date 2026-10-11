---
name: nextjs-expert
description: Advanced Next.js (App Router) — Server Components, Server Actions, streaming, suspense, route handlers, middleware, ISR, edge runtime, metadata API. Use when starting a new project with Next.js (NOT kryptosphere-website which is Vite), building academy.* or accelerator.* subdomains if chosen Next, or any non-KS Next project.
---

# Expert Next.js

## Quand l'utiliser
- **Nouveau projet** en Next.js (pas `kryptosphere-website` qui est Vite).
- Sous-domaines `academy.*` / `accelerator.*` si Next.js est retenu pour eux.
- Tout autre projet React Yohan où SSR/SEO/SSG sont critiques.

## Méthode

### App Router (Next 13+ standard)
- Structure : `app/` avec `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- **Server Components par défaut** : pas de hooks, pas d'event handlers, fetch direct (`async` component).
- `'use client'` UNIQUEMENT pour : interactivité, hooks, browser APIs.

### Fetch data
- Server Component : `await fetch(...)` direct, dédupé automatiquement par Next.
- Cache : `{ cache: 'force-cache' | 'no-store' }` + `next: { revalidate: N }`.
- **Mutations** : Server Actions (`'use server'` function), pas d'API route artificielle.

### Streaming + Suspense
- Loading UI granulaire avec `<Suspense fallback={...}>`.
- `loading.tsx` au niveau d'un segment de route.
- Streaming améliore TTFB / LCP.

### Metadata API (SEO)
```tsx
export const metadata: Metadata = {
  title: '...',
  description: '...',
  openGraph: { images: ['/og.png'] },
};
```

Ou dynamique :
```tsx
export async function generateMetadata({ params }): Promise<Metadata> { ... }
```

### Route Handlers (API)
- `app/api/<route>/route.ts` avec `GET`, `POST`, etc. exportés.
- Server Actions souvent préférables pour les mutations internes (couple front/back tightement, type-safe).
- Route handlers pour : webhooks, API publique, OAuth callbacks.

### Middleware
- `middleware.ts` à la racine.
- Pour : redirects auth, géo-redirection, A/B testing, headers de sécu.
- **Edge runtime** par défaut → pas de Node API.

### ISR (Incremental Static Regeneration)
- `revalidate` sur les fetches → page régénérée à intervalle.
- Excellent pour pages content-heavy (blog, doc, landing event).

### Edge runtime
- `export const runtime = 'edge'`.
- Latence ultra-basse mais limites : pas de Node API, certaines libs incompatibles (Prisma sans adapter).

### Cache complexity
Next 14+ a un système de cache à plusieurs niveaux. Comprendre AVANT de débugger :
1. Request memoization (per render).
2. Data cache (cross-request).
3. Full route cache (build/ISR).
4. Router cache (client navigation).

Default = beaucoup mis en cache. Désactiver explicitement si data dynamique.

### Déploiement
- Vercel = first-class. Pas de surprise.
- Self-hosted : possible mais perds ISR magic + edge.

## Standards
- [references/standards.md § Next.js/React](../../../references/standards.md).
- Cohérent avec règles `.claude/rules/`.

## Anti-patterns
- `'use client'` au top du root layout (perd tous les bénéfices RSC).
- API route pour ce qu'une Server Action ferait mieux.
- Fetch dans `useEffect` côté client alors que c'est un Server Component possible.
- `Image` avec `width`/`height` faux → CLS + warnings.

## Exemples
- Sous-domaine `academy.ks.*` en Next 14 App Router avec MDX pour le contenu.
- API webhook Stripe en route handler `app/api/webhooks/stripe/route.ts`.
