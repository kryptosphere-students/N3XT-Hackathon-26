---
name: accessibility-expert
description: Web accessibility — WCAG 2.1 AA/AAA, ARIA patterns, keyboard navigation, screen reader testing, color contrast, focus management, accessible forms. Use when auditing kryptosphere-website accessibility, adding interactive components, or preparing for a public event audience.
---

# Expert Accessibilité

## Quand l'utiliser
- Audit pré-event majeur (audience hétérogène, attentes inclusives).
- Ajout d'un composant interactif custom (modal, dropdown, dialog, carousel).
- Refactor formulaires.
- Conformité légale (si futurs partenariats publics, obligation accessibilité numérique en France).

## Méthode

### Niveau cible
- **WCAG 2.1 AA** : standard reasonable pour site public.
- AAA seulement si engagement explicite.

### Audit rapide (par page)
1. **Navigation clavier** : Tab traverse tout, Enter active, Esc ferme modals.
2. **Focus visible** : `:focus-visible` style net (pas `outline: none` sans alternative).
3. **Screen reader** : VoiceOver (Mac), NVDA (Windows).
4. **Contraste** : text vs background ≥ 4.5:1 (AA normal), 3:1 (AA large text).
5. **Outils** : Axe DevTools, Lighthouse Accessibility, WAVE.

### Composants critiques
- **Modals/Dialogs** : Radix UI Dialog (déjà chez Yohan) → géré. Trap focus + restauration.
- **Dropdowns / Menus** : Radix UI gère ARIA correctement.
- **Forms** : `<label for>` lié à `<input id>`, `aria-describedby` pour helper text, `aria-invalid` + message d'erreur lisible.
- **Boutons vs liens** : `<button>` pour action, `<a>` pour navigation. Pas `<div onClick>`.

### ARIA — principes
1. **Pas d'ARIA > ARIA mal utilisé**. Préférer HTML sémantique.
2. `role="button"` sur un `<div>` → préférer un `<button>`.
3. `aria-label` sur les boutons icon-only (`<button aria-label="Fermer">×</button>`).
4. `aria-live` pour les notifications dynamiques.

### Images & média
- `alt` descriptif (jamais vide sauf décoratif → `alt=""`).
- Vidéos : captions + transcript.
- SVG : `<title>` interne + `role="img"`.

### Contraste shadcn/ui + Tailwind
- Tester les variants ghost/outline en dark mode (souvent < AA).
- Personnalisation des tokens : valider chaque pair via outil (e.g. WebAIM Contrast Checker).

### Mobile / touch
- Cible tactile ≥ 44x44 px (WCAG 2.5.5).
- `viewport` permet zoom (pas de `user-scalable=no`).

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- [SOP Audit pré-release](../../../references/sops/audit-prerelease.md).

## Anti-patterns
- `tabindex` autre que 0 ou -1 (manipule l'ordre, bug majeur).
- Couleur seule pour transmettre l'info (rouge = erreur → ajouter texte + icône).
- `<div onClick>` au lieu de `<button>`.
- Désactiver le focus outline sans alternative.

## Exemples
- Audit `kryptosphere-website` avec Axe + plan correctif priorisé.
- Composant `<KsAlert>` avec ARIA live region + dismiss button accessible.
