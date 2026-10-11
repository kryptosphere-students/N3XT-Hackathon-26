---
name: tech-review-cards
description: Generate technical review/study cards from coursework projects — extract key concepts, create Q&A questionnaires (open + multiple choice + case studies), explain implementation choices, build cheat sheets. Use when preparing for soutenance/oral, reviewing for exams, creating study guides from PA Actify / T3 4AIBC / hackathon projects, or onboarding the user back into a project after a pause.
---

# Tech Review Cards — Fiches de révision techniques

## Quand l'utiliser
- Préparation soutenance PA M1 / M2 (extraire les concepts d'Actify pour défendre oralement).
- Révision avant partiels / examens pratiques 4AIBC.
- Reprise d'un projet après une pause (onboarding-self).
- Dossier de révision multi-modules (T1, T2, T3).
- Documentation pédagogique d'un projet pour partage KS (sous-domaine `academy.*` à venir).

## Format de sortie

**HTML interactif standalone par défaut** (format "page web facilement ouvrable, bookmarkable") :
- 1 fichier `.html` par fiche concept, ouvre direct dans le navigateur.
- Tailwind CSS via CDN.
- Vanilla JS pour : afficher/cacher les réponses des QCM, naviguer entre fiches, marquer "maîtrisé/à revoir".
- Dark mode par défaut, layout lisible (typo serrée, code highlighté).

Structure standard d'une fiche HTML :
1. **Header** : nom du concept + projet source + niveau de maîtrise (auto-éval).
2. **Définition** + **Rôle dans le projet** + **Comment ça marche** (sections classiques).
3. **Code de référence** : encarts avec chemin + numéro de ligne, snippets formatés.
4. **Questions de révision** : ouvertes (textarea pour notes perso), QCM (vérification interactive), cas pratique (révélation progressive de la réponse).
5. **Pièges fréquents** + **Aller plus loin**.
6. **Footer** : navigation vers fiches voisines + retour à `index.html`.

**`index.html`** racine du dossier `revisions/` : liste toutes les fiches du projet + niveau de maîtrise + filtre par tag.

Format **Markdown** disponible en fallback si demandé explicitement (sortie `.md` au lieu de `.html`).

## Méthode

### Étape 1 — Identifier les concepts
1. Lire la structure du projet cible : README, code, schémas, docs (cahier des charges, dossier technique).
2. Lister **5-15 concepts techniques clés** par projet (pas plus — sinon dilution).
3. Prioriser : concepts centraux > périphériques. Critère : "si la question tombe à l'oral, je dois savoir".
4. Marquer les concepts **transverses** (apparaissent dans plusieurs modules) — fiche unique réutilisable.

### Étape 2 — Rédiger une fiche par concept

Template Markdown :

```markdown
# <Concept>

## Définition
<1-2 phrases, neutre, précise>

## Rôle dans ce projet
<Pourquoi ce concept apparaît ici, où exactement (fichier, module, fonction)>

## Comment ça marche
<Explication technique. Schéma ASCII ou Mermaid si pertinent>

## Code de référence
- `path/to/file.ts:L42-L78` — implémentation principale.
- `path/to/test.spec.ts:L10-L30` — couverture tests.

## Questions de révision

### Questions ouvertes (réponse rédigée 3-5 lignes)
1. <Question 1>
2. <Question 2>
3. <Question 3>

### QCM
1. <Question>
   - A. <option>
   - B. <option>
   - C. <option>
   - D. <option>

   <details><summary>Réponse</summary>B — justification courte.</details>

### Cas pratique
**Scénario** : <contexte technique>
**Question** : <que faut-il faire / quel est le risque / comment corriger ?>

<details><summary>Réponse attendue</summary>...</details>

## Pièges fréquents
- <Piège 1>
- <Piège 2>

## Aller plus loin
- <Doc officielle / blog post / RFC>
```

### Étape 3 — Créer un index récapitulatif

`INDEX.md` dans le dossier de révision :

```markdown
# Index — Révisions <Projet>

| Concept | Fiche | Maîtrise (auto-éval) |
|---|---|---|
| OAuth flow | [oauth-flow.md](oauth-flow.md) | ☐ Pas vu / ☐ En cours / ☐ Solide |
| Reentrancy | [reentrancy.md](reentrancy.md) | ☐ / ☐ / ☐ |
| ... | ... | ... |
```

## Stockage
Par défaut : dans le **dossier du projet** lui-même, sous `revisions/` ou `docs/revisions/`.

Exemples :
- PA Actify : `C:\Users\yohan\Documents\Formations\4AIBC\PA\docs\revisions\`
- T3 4AIBC (par module) : `C:\Users\yohan\Documents\Formations\4AIBC\3rd-Trimestre\<module>\revisions\`
- Hackathon SKOLAE : `C:\Users\yohan\Documents\Formations\4AIBC\Hackathon-SKOLAE-2k26-michelin-guide\revisions\`

Une fiche = un fichier `.md`. Naming : `<slug-court>.md` (ex: `oauth-flow.md`, `reentrancy.md`).

## Standards
- **Français** pour les explications (cf. `.claude/rules/02-language-fr.md`).
- **Anglais** pour code, identifiants, noms de fonctions.
- **Liens vers code** avec ligne précise (`path:L42-L78`) quand possible.
- **Pas de paraphrase** : expliquer le **pourquoi** et la **valeur**, pas répéter le code.
- **Pas de notes / évaluations** enseignants stockées dans les fiches (cf. CLAUDE.md §4.5).

## Anti-patterns
- Fiches qui paraphrasent la doc officielle sans ajouter de contexte projet.
- 50 fiches superficielles plutôt que 8 solides.
- Questions sans corrigé (vérifier que chaque QCM/cas a sa réponse).
- Pas de lien vers le code → fiche désincarnée.
- Mélanger plusieurs concepts dans une seule fiche.

## Exemples par projet

### PA Actify — fiches probables
- `oauth-flow.md` — Authentification OAuth + cookie httpOnly (lien vers `API_ACTIFY_NODE`).
- `data-migration.md` — Si migration data Mongo → SQL.
- `reentrancy-cei.md` — Reentrancy + Checks-Effects-Interactions (lien `SMARTCONTRACTS_ACTIFY`).
- `docker-compose-prod.md` — Multi-services en prod (différences avec dev).
- `zod-validation.md` — Validation runtime aux frontières HTTP.
- `db-schema-actify.md` — Modèle de données (lien `DB_ACTIFY.png`).

### T3 4AIBC — Protocole Authentification
- `jwt-signing-rs256-vs-hs256.md`
- `pkce-flow.md`
- `refresh-token-rotation.md`
- `oauth-owasp-top-issues.md`

### T3 4AIBC — Tests et Automatisation
- `test-pyramid.md`
- `coverage-target-vs-real.md`
- `ci-cd-pipeline.md` (lien skill `cicd-pipeline`)
- `mutation-testing.md`
- `flaky-tests-diagnosis.md`

### Hackathon SKOLAE 2k26 (Michelin)
- Selon le périmètre du livrable. Probable : intégration API, algo de matching, scoring.

## Workflow type pour un nouveau dossier de révision
1. Skill invoqué avec : "Génère les fiches de révision pour <projet>".
2. Claude lit la structure du projet (README, code, docs).
3. Claude propose une liste de 5-15 concepts → demande validation utilisateur.
4. Claude génère les fiches une par une (ou en batch si demandé).
5. Claude crée le `INDEX.md` à la fin.
6. Auto-évaluation maîtrise par le user au fil des révisions.
