---
name: tailwind-expert
description: Advanced Tailwind CSS — config customization, design tokens, theme extension, plugin authoring, responsive design, dark mode, arbitrary values, performance (JIT, purge). Use when extending tailwind.config, debugging style issues in kryptosphere-website, building a design system, or migrating from CSS-in-JS to Tailwind.
---

# Expert Tailwind

## Quand l'utiliser
- Étendre `tailwind.config.ts` (tokens couleurs, spacings, fonts custom KS).
- Construire des composants avec variants (`class-variance-authority` + Tailwind).
- Debug d'un style qui ne s'applique pas (specificity, purge, ordre des classes).
- Audit cohérence visuelle `kryptosphere-website`.

## Méthode

### Config
- **Design tokens** dans `theme.extend` (jamais override sauf raison forte).
- Couleurs en CSS variables (`hsl(var(--primary))`) pour theming dynamique. Convention shadcn.
- Spacings sur échelle multiple de 4 (`0.5 = 2px`, `1 = 4px`, `4 = 16px`).
- `container` + `screens` customs si breakpoints non standards.

### Composants
- **`cn()` utility** (clsx + tailwind-merge) pour merger les classes (shadcn convention).
- **Variants via cva** : déclarer les variants typées + defaultVariants.
- **`@apply` parcimonieux** : seulement pour des patterns hyper-récurrents et stables.

### Responsive + Dark mode
- Mobile-first : pas de `max-*:`, partir du plus petit.
- `dark:` via `class` strategy (next-themes).
- `prefers-reduced-motion` → utiliser le `motion-safe:` modifier.

### Performance
- JIT actif par défaut sur Tailwind 3+.
- `content` glob précis dans `tailwind.config.ts` pour purge correcte.
- Pas de `safelist` sauf nécessité (classes générées dynamiquement).

### Arbitrary values
- `w-[37px]` OK pour one-off, mais si récurrent → ajouter au theme.

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- Pas de CSS-in-JS additionnel (Tailwind exclusif sur le site KS).

## Anti-patterns
- Override de toute la palette `theme.colors` (perd les tokens shadcn).
- Mix CSS modules + Tailwind sans raison.
- `style={{ ... }}` inline alors qu'une classe Tailwind existe.
- Refactor d'un composant shadcn en place (préférer wrapping).

## Exemples
- Ajouter une palette `--ks-brand-*` dans `tailwind.config.ts` + composants `<KsButton>`.
- Variant `cva` pour un Badge avec 4 tons (info / success / warning / danger).
