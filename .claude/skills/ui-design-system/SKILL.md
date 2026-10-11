---
name: ui-design-system
description: UI design system architecture — design tokens, component library structure, variants with CVA, theming, documentation with Storybook, shadcn/ui extension patterns. Use when formalizing the kryptosphere-website component library, creating a KS-branded design system, or aligning visuals across academy.* / accelerator.* subdomains.
---

# Système de Design UI

## Quand l'utiliser
- Formaliser les composants `kryptosphere-website` en design system documenté.
- Lancement sous-domaines (`academy.*`, `accelerator.*`) → cohérence visuelle KS.
- Onboarding d'un autre dev / designer sur la charte UI KS.
- Refonte ponctuelle d'un composant (Button, Card) pour devenir standard.

## Méthode

### Architecture en couches
1. **Design tokens** (couleurs, espacement, typo, radius, shadow) → CSS variables + Tailwind config.
2. **Primitives** : composants atomiques (Button, Input, Badge) — souvent shadcn/ui.
3. **Patterns** : composants composés (FormField = Label + Input + Error).
4. **Templates** : layouts de page (HeroSection, EventCard).
5. **Documentation** : Storybook ou page dédiée.

### Design tokens (cas KS)
- Convention shadcn : couleurs en HSL via CSS variables (`--primary`, `--secondary`, `--accent`, ...).
- Définir une palette **brand KS** (à confirmer auprès du pôle Com KS) :
  - `--ks-primary` (couleur identitaire)
  - `--ks-accent`
  - `--ks-neutral-{50..900}`
- Spacings sur échelle Tailwind par défaut.
- Typo : 1 police principale (display), 1 secondaire (body). Limiter à 2 max.

### Composants — convention
- Dossier `src/components/ui/` (shadcn copies, modifier avec parcimonie).
- Dossier `src/components/ks/` (composants KS-spécifiques, étendant shadcn).
- Variants via `cva` (class-variance-authority — déjà installé).

Exemple `KsButton` :
```tsx
import { cva } from 'class-variance-authority';
const ksButton = cva('rounded-md font-medium transition', {
  variants: {
    intent: { primary: '...', secondary: '...', ghost: '...' },
    size: { sm: '...', md: '...', lg: '...' },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});
```

### Documentation
- **Storybook** : si équipe + plusieurs consumers. Lourd à maintenir solo.
- **Page `/design-system`** dans `kryptosphere-website` : alternative légère. Liste composants + variants + code source.

### Theming dark/light
- `next-themes` (déjà installé) + `class` strategy.
- Tous les composants utilisent les CSS variables, pas des couleurs hardcoded.

### Cohérence cross-subdomains
- Extraire la design system en package partagé (`@ks/ui`) si plusieurs apps consomment.
- Sinon : copier-coller cohérent (acceptable pour 2-3 apps tant qu'elles partagent peu).

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- Pas de modification en place des composants shadcn (extension par composition).

## Anti-patterns
- Hex colors hardcoded partout (`text-[#ff0000]`).
- 5 variantes de Button visuellement quasi-identiques.
- Storybook installé mais jamais maintenu.
- Modifier `src/components/ui/button.tsx` (shadcn) plutôt que d'étendre.

## Exemples
- Définir 5 composants `ks-*` (Button, Card, EventBadge, SponsorLogo, HeroSection).
- Page `/design-system` listant la palette KS + composants.
