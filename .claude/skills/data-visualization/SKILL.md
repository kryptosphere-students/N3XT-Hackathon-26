---
name: data-visualization
description: Data visualization for web — chart selection (Recharts, D3, Chart.js, Visx), dashboard design, accessibility for charts, performance with large datasets. Use when building a dashboard in kryptosphere-website, visualizing event metrics for sponsoring decks, or presenting PA Actify data.
---

# Visualisation de Données

## Quand l'utiliser
- Dashboard event KS (inscriptions, sponsors, métriques).
- Sponsoring deck : graphes de portée, audience, ROI.
- PA Actify : visualisation des données métier.
- Rapport post-event : charts dans une page récap.

## Méthode

### Choix de la lib
- **Recharts** (déjà dans `kryptosphere-website`) : React-friendly, déclaratif, bon pour 80% des cas.
- **Chart.js** : canvas, perf sur gros datasets, mais less React-y.
- **D3.js** : ultime contrôle, mais lourd et complexe. Pour visualisations custom uniques.
- **Visx** (Airbnb) : composants D3 React. Bon compromis pour custom.
- **Apache ECharts** : très complet, perf, mais bundle gros.

Default Yohan : **Recharts**. Passer à autre chose seulement si limite identifiée.

### Choix du chart
- **Évolution dans le temps** : line chart.
- **Comparaison de catégories** : bar chart.
- **Composition d'un tout** : stacked bar > pie (sauf 2-3 segments).
- **Corrélation 2 variables** : scatter.
- **Distribution** : histogram, box plot.
- **Géo** : leaflet (déjà installé site KS), Mapbox.

### Design
- **1 chart = 1 message**. Si plusieurs messages → plusieurs charts.
- **Titre** clair (la question à laquelle le chart répond).
- **Axes labélisés** + unité (€, %, count).
- **Légende** si > 1 série.
- **Couleurs** : palette accessible (cf. skill `accessibility-expert`), distinguer par forme/pattern aussi pas que couleur.
- **Tooltips** sur hover/touch.

### Performance
- > 1000 points : envisager canvas (Chart.js) plutôt que SVG (Recharts).
- Aggregation côté serveur si > 10k points bruts.
- Virtualisation si liste de charts.

### Responsive
- `<ResponsiveContainer>` de Recharts.
- Tester sur mobile : axes lisibles, tooltips utilisables au touch.

### Accessibilité
- `<title>` et `<desc>` ARIA dans le SVG.
- Tableau de données alternatif (toggle "voir les données").

## Standards
- [references/standards.md § Vite+React](../../../references/standards.md).

## Anti-patterns
- Pie chart avec 7+ segments.
- Axe Y qui ne commence pas à 0 sans justification (exagère les variations).
- Couleurs seules pour distinguer 5 séries.
- 1000 datapoints SVG laggy.

## Exemples
- Dashboard sponsor `kryptosphere-website` : bar chart par partenaire, évolution donations sur l'année.
- Carte interactive `react-leaflet` (déjà installé) : antennes KS en Europe.
