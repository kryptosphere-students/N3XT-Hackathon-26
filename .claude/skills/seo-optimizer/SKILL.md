---
name: seo-optimizer
description: Technical SEO and content strategy — meta tags, Open Graph, schema.org structured data, sitemap, robots.txt, semantic HTML, Core Web Vitals impact, indexing strategy. Use when auditing kryptosphere-website SEO before an event, launching academy/accelerator subdomains, or optimizing landing pages for ranking.
---

# Optimiseur SEO

## Quand l'utiliser
- Audit SEO `kryptosphere-website` (cible : recherche "blockchain étudiant", "hackathon Web3 France", "association blockchain ESGI").
- Lancement sous-domaines `academy.*`, `accelerator.*`.
- Page event majeur (hackathon, conférence) à promouvoir.
- Recherche Google Search Console montrant chute / pages non indexées.

## Méthode

### Checklist technique
1. **`<title>`** unique par page, ≤ 60 char, mot-clé en début si possible.
2. **`<meta name="description">`** unique, 140-160 char, CTA implicite.
3. **`<link rel="canonical">`** sur toute page (auto si Next, manuel sinon).
4. **Open Graph** (`og:title`, `og:description`, `og:image` 1200x630, `og:url`).
5. **Twitter Card** (`twitter:card`, `twitter:image`).
6. **JSON-LD schema.org** : `Organization` (KS), `Event` (hackathons), `Article` (blog).
7. **`sitemap.xml`** généré au build + soumis à Google Search Console.
8. **`robots.txt`** explicite (allow tout sauf admin/preview).
9. **`hreflang`** si multilingue (FR/EN à terme ?).

### Semantic HTML
- 1 seul `<h1>` par page.
- Hiérarchie `<h2>` / `<h3>` cohérente.
- `<nav>`, `<main>`, `<article>`, `<aside>` aux bons endroits.
- Liens : ancre descriptive (pas "cliquez ici").

### Performance = SEO
- Core Web Vitals = facteur de ranking. Cf. skill `performance-optimizer`.
- Mobile-first indexing : audit mobile obligatoire.

### Indexing
- Google Search Console : monitor coverage + queries.
- `noindex` pour pages d'admin, drafts, preview Vercel (déjà no-index par Vercel).
- Préférer une page complète bien rankée à 10 pages thin content.

### Stratégie contenu
- Mot-clé principal par page (Search Console + tools type Ahrefs / Ubersuggest).
- Long-tail : "comment participer hackathon blockchain France" > "blockchain".
- Backlinks : annuaires étudiants, partenariats, sponsors.

### Vite + React (cas `kryptosphere-website`)
- Pas de SSR natif. Le pre-rendering via SSG (`vite-plugin-ssr`, ou migration partielle Next) à considérer pour les pages SEO-critiques.
- `react-helmet-async` pour gérer les tags meta dynamiques côté client (limites : Google rend JS mais préfère du SSR).

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).

## Anti-patterns
- Même `<title>` et `<meta description>` sur toutes les pages.
- Images sans `alt` (perd SEO + accessibilité).
- Contenu généré seulement en JS critique au SEO sans pre-rendering.
- `robots.txt` qui bloque tout par erreur.

## Exemples
- Audit `kryptosphere-website` : générer un rapport (LCP, meta présents, sitemap, schema).
- Page event hackathon : structurer en `Event` JSON-LD + OG image custom.
