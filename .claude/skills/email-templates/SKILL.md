---
name: email-templates
description: Responsive HTML email templates — MJML, React Email, dark mode support, client compatibility (Gmail, Outlook), inline CSS, deliverability. Use when building emails for KS-France-Mailing-Automatisation, sponsoring outreach campaigns, or event notifications.
---

# Templates Email

## Quand l'utiliser
- Projet `KS-France-Mailing-Automatisation` (en cours dans ton auto-memory).
- Campagne sponsoring : email outreach formaté.
- Notifications event (confirmation inscription, rappel, post-event).
- Newsletter KS si lancée.

## Méthode

### Choix de l'outil
- **React Email** : composants React → HTML email. Best DX 2026.
- **MJML** : balisage XML simplifié → HTML. Plus mature, écosystème large.
- HTML brut : à éviter (douleur multi-client).

Recommandation Yohan : **React Email** (alignement stack React/TS).

### Setup React Email
1. `pnpm add react-email @react-email/components`.
2. Dossier `emails/` avec un fichier `.tsx` par template.
3. `npx react-email dev` pour preview live.
4. `npx react-email export` pour HTML compilé.

### Composants de base (React Email)
- `<Html>`, `<Head>`, `<Body>` : conteneurs racine.
- `<Container>` : limite la largeur (600px par défaut).
- `<Section>`, `<Row>`, `<Column>` : layout.
- `<Text>`, `<Heading>`, `<Link>`, `<Button>`.
- `<Img>` : image avec `width` + `height` obligatoires.

### Règles de compatibilité multi-client
1. **Tables** pour layout (Outlook ne support pas flex/grid).
2. **Inline CSS** (`<style>` blocs filtrés par Gmail).
3. **Pas de JS** (ignoré ou bloqué).
4. **Pas de webfonts custom** (fallback système : Arial, Georgia).
5. **Pas de CSS Grid / Flexbox** (cassé Outlook).
6. **Images** : `width` + `height` explicites, `alt`, héberger sur un domaine fiable (pas localhost).
7. **Dark mode** : `@media (prefers-color-scheme: dark)` + meta `<meta name="color-scheme" content="light dark">`.

### Deliverability
- **SPF + DKIM + DMARC** configurés sur le domaine `kryptosphere.eu` (ou équivalent).
- **From** = adresse du domaine (pas Gmail perso).
- **Subject** : pas spam-y ("FREE!!!", trop de majuscules).
- **List-Unsubscribe** header (RGPD + bonne pratique).
- **Plain text alternative** (multipart/alternative).

### Test
- **Litmus** ou **Email on Acid** pour preview multi-client.
- Envoi test à Gmail / Outlook / Apple Mail avant campagne.
- Vérifier en dark mode des clients qui le supportent.

### Légal (asso loi 1901)
- Mention obligatoire : raison sociale, adresse, SIREN (si applicable).
- Lien unsubscribe fonctionnel.
- RGPD : consentement préalable (sauf B2B prospection professionnelle limitée).

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).
- Pas de stockage de listes nominatives en mémoire Claude Code (cf. CLAUDE.md §4.5).

## Anti-patterns
- Email pesant 5 MB (filtres anti-spam).
- Images sans `alt` (lisibilité + Gmail bloque images par défaut).
- Hardcoded `width: 100vw` (foiré sur tous les clients email).
- Pas de version texte.

## Exemples
- Template "Confirmation inscription hackathon" avec dark mode.
- Template "Outreach sponsor" avec pitch + lien deck Canva.
