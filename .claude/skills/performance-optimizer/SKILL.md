---
name: performance-optimizer
description: Web performance optimization — Core Web Vitals (LCP, INP, CLS), Lighthouse, code splitting, lazy loading, bundle analysis, RUM. Use when auditing kryptosphere-website performance, before a major event with traffic spike, or after Lighthouse score regression.
---

# Optimiseur Performance

## Quand l'utiliser
- Lighthouse score < 90 sur `kryptosphere-website`.
- Avant un event majeur (pic de trafic prévisible).
- LCP, INP ou CLS dégradés selon Vercel Analytics / Speed Insights (déjà installé sur le site).
- Bundle JS soudainement gros après une feature.

## Méthode

### Mesurer AVANT optimiser
1. **Vercel Speed Insights** (RUM réel) — déjà actif sur `kryptosphere-website`.
2. **Lighthouse** en mode prod (pas dev).
3. **WebPageTest** pour vue tiers (filmstrip, waterfall).
4. **Bundle analyzer** : `rollup-plugin-visualizer` pour Vite.

### Core Web Vitals — cibles
| Metric | Bon | À améliorer | Mauvais |
|---|---|---|---|
| LCP | < 2.5s | < 4s | ≥ 4s |
| INP | < 200ms | < 500ms | ≥ 500ms |
| CLS | < 0.1 | < 0.25 | ≥ 0.25 |

### LCP (Largest Contentful Paint)
- Image hero optimisée (AVIF/WebP, dimensions explicites, pas de lazy).
- `<link rel="preload" as="image">` sur le hero.
- Fonts : `font-display: swap`, preload des fonts critiques.
- Critical CSS inline si justifié.
- Pas de bloquage JS au render initial (code split).

### INP (Interaction to Next Paint)
- Tâches longues (> 50ms) → splitter (`scheduler.yield()`, `setTimeout 0`).
- Pas de gros synchrone dans les handlers (debounce, throttle).
- React : `useDeferredValue`, `useTransition` pour les updates non urgentes.

### CLS (Cumulative Layout Shift)
- `width` + `height` sur images.
- Réserver l'espace pour ads/embeds.
- Pas d'injection de contenu au-dessus du viewport sans placeholder.

### Bundle size
- **Code splitting** par route (`React.lazy` + `Suspense`).
- **Tree shaking** : imports nommés (`import { x } from 'lib'`, pas `import lib from 'lib'`).
- **Audit deps** : `npm ls --depth=0 | sort -k2 -h` ou bundle analyzer.
- Libs à surveiller : lodash (utiliser native ou imports atomiques), moment (préférer date-fns — déjà chez Yohan).

### Vercel-specific
- ISR si pertinent (Next).
- Edge functions pour API ultra-rapides.
- Image API Vercel si activée.

## Standards
- [references/standards.md § Vite+React + Next.js/React](../../../references/standards.md).
- [SOP Audit pré-release](../../../references/sops/audit-prerelease.md).

## Anti-patterns
- Optimiser sans mesurer ("au feeling").
- `React.memo` ou `useMemo` partout sans data.
- Charger tous les Radix UI dans le bundle alors qu'on en utilise 5.
- Hero image en JPG 2MB.

## Exemples
- Audit Lighthouse + plan d'attaque trié par impact (LCP → INP → CLS).
- Split `react-leaflet` (lourd) sur la page maps en lazy chunk.
