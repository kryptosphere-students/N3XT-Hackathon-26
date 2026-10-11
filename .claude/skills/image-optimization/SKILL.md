---
name: image-optimization
description: Web image optimization — WebP, AVIF, responsive images with srcset, lazy loading, sharp, imagemin pipelines, CDN image transforms (Vercel/next/image). Use when auditing images on kryptosphere-website, extending the existing compress-images-to-webp script, or optimizing LCP for landing pages.
---

# Optimisation Images

## Quand l'utiliser
- Audit perf `kryptosphere-website` (LCP / poids page).
- Ajout d'un dossier d'images events (KS hackathons, sponsors).
- Extension du script existant `scripts/compress-images-to-webp.ts`.
- Préparation visuels pour un event majeur (poids contrôlé).

## Méthode

### Format selon usage
- **AVIF** : meilleur ratio compression/qualité, support 95%+ navigateurs modernes. **Préféré 2026**.
- **WebP** : fallback. Support universel.
- **JPEG** : fallback ultime (rarement utile sauf très vieux navigateurs).
- **PNG** : seulement si transparence + faible nombre de couleurs.
- **SVG** : icônes, illustrations vectorielles. Optimiser avec SVGO.

### Pipeline pour kryptosphere-website
Le site a déjà `sharp` + `imagemin` + `imagemin-webp` + `imagemin-mozjpeg` + `imagemin-svgo` + le script `compress-images-to-webp.ts`.

**Améliorations possibles** :
1. Ajouter sortie AVIF en plus du WebP.
2. Générer plusieurs tailles (`srcset`) : 480, 768, 1200, 1920.
3. Générer `<picture>` avec `<source type="image/avif">` + `<source type="image/webp">` + `<img>` fallback.
4. Préserver le ratio + lazy loading natif.

### Responsive images
```
<picture>
  <source srcset="img-480.avif 480w, img-1200.avif 1200w" type="image/avif" sizes="(max-width: 768px) 100vw, 50vw" />
  <source srcset="img-480.webp 480w, img-1200.webp 1200w" type="image/webp" sizes="..." />
  <img src="img-1200.jpg" loading="lazy" width="1200" height="600" alt="..." />
</picture>
```

`width` + `height` obligatoires pour éviter le CLS.

### Vercel Image Optimization
- Sans Next.js (cas Vite + Vercel), pas de `next/image`. Utiliser le pipeline build manuel.
- Possible : passer par un CDN d'image (Imgix, Cloudinary, Vercel Image API si activé).

### Lazy loading
- `loading="lazy"` natif pour `<img>`.
- `react-lazy-load-image-component` déjà installé : utile pour placeholder + transitions.

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- Pas d'image > 200 KB par défaut en prod (sauf hero soigneusement justifié).

## Anti-patterns
- Servir un PNG 5MB en hero.
- Pas de `width`/`height` → CLS.
- `lazy` sur les images above-the-fold (LCP dégradé).
- `srcset` sans `sizes`.

## Exemples
- Étendre `compress-images-to-webp.ts` pour sortir AVIF + 3 tailles + manifest JSON.
- Composant `<KsResponsiveImage src basename alt>` qui génère `<picture>` automatiquement.
