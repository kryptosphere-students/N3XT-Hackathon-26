# Travailler à l'endroit prévu — pas de sandbox parallèles

Quand l'architecture cible existe déjà (page, route, composant prévus dans le plan), **modifier directement ces fichiers**. Ne PAS créer de page démo, sandbox, ou route parallèle "pour valider visuellement".

## Anti-pattern explicite

- Créer `/forms-demo`, `/preview`, `/test-xyz` ou tout dossier ad-hoc pour montrer un composant en attendant l'intégration "plus tard".
- Mettre un placeholder "Bientôt disponible" sur la page cible **et** créer une démo isolée à côté.
- Dupliquer du code de page pour "isoler" un essai.

Ces choix gaspillent des tokens (génération + relecture), polluent l'arbo, et créent une dette immédiate (la démo doit être supprimée).

## Règle

Si un composant doit être consommé par une page X (déjà créée ou prévue dans le plan), l'intégrer **directement** dans X. La validation visuelle se fait sur cette page-là.

Exception unique : composant générique réutilisable dans une lib design system (Storybook formel ou équivalent). Ce n'est pas le cas pour les CRUD applicatifs.

## Format proposition

Si je crois vraiment qu'une sandbox est nécessaire, **demander explicitement** avant de la créer, en exposant le coût (X fichiers ajoutés qui seront supprimés ensuite).

Source : feedback utilisateur 2026-05-23 — création d'une `/forms-demo` redondante alors que les pages cibles existaient avec un `PlaceholderPage` "Bientôt disponible".
