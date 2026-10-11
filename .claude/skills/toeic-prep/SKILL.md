---
name: toeic-prep
description: TOEIC English exam preparation — Listening (Parts 1-4) and Reading (Parts 5-7) practice questions, vocabulary drills, grammar exercises, mock tests, strategy tips, error analysis. Generate original questions in TOEIC style (no copyrighted material), build personalized study plans. Use when preparing for TOEIC certification (often required for ESGI engineering diploma validation), targeting weak areas, or building a multi-week revision plan.
---

# TOEIC Prep

## Quand l'utiliser
- Préparation à la certification **TOEIC Listening & Reading** (souvent requise pour valider M1 / M2 ESGI).
- Diagnostic des points faibles (grammaire, vocabulaire, listening, reading).
- Génération de tests blancs ciblés (Part X uniquement, ou complet).
- Plan de révision sur N semaines avant date d'examen.
- Analyse d'erreurs après un test blanc (patterns récurrents).

## Structure du TOEIC L&R

### Listening — 100 questions / 45 min
- **Part 1** — Photographs (6 questions) — descriptions d'images.
- **Part 2** — Question-Response (25 questions) — conversation courte (1 question → 3 réponses possibles).
- **Part 3** — Conversations (39 questions ; 13 dialogues × 3 questions) — 2-3 speakers.
- **Part 4** — Short Talks (30 questions ; 10 monologues × 3 questions).

### Reading — 100 questions / 75 min
- **Part 5** — Incomplete Sentences (30 questions) — grammaire + vocabulaire.
- **Part 6** — Text Completion (16 questions ; 4 textes × 4 trous).
- **Part 7** — Reading Comprehension (54 questions) — single et multiple passages.

**Total** : 200 questions, 2h, score sur 990 (495 listening + 495 reading).

## Format de sortie

**HTML interactif standalone par défaut** (format "page web facilement ouvrable, bookmarkable, ré-utilisable session après session") :
- 1 fichier `.html` autonome qui s'ouvre direct dans le navigateur (`file://`).
- Tailwind CSS via CDN (pas de build, pas de deps locales).
- Vanilla JS pour l'interactivité : radio buttons, vérification individuelle ou globale, score live, timer, reset.
- Dark mode par défaut, layout responsive.
- Hors-ligne fonctionnel (sauf CDN Tailwind au premier load).

Structure standard d'une page :
1. **Header** : titre + niveau + volume + temps cible + score live + timer + boutons "Tout vérifier" / "Reset".
2. **Questions** (5-20) : énoncé + radio A/B/C/D + bouton "Vérifier" individuel + bloc explication révélable (réponse correcte + justification + pièges + notes complémentaires).
3. **Patterns récapitulatif** : tableau de synthèse des règles couvertes.
4. **Auto-évaluation** : score final, temps réel, checkboxes patterns à retravailler.

Format **Markdown** disponible en fallback uniquement si demandé explicitement.

Exemple existant : `Documents/Formations/TOEIC/2026-05-21-grammar-conditionals-lvl700.html`.

## Méthode

### À demander à chaque session
- **Partie cible** (1-7 ou mixte).
- **Niveau** : débutant (~400), intermédiaire (~700), avancé (~900).
- **Volume** : 5, 10, 20 questions, ou test blanc complet.
- **Thématique** optionnelle : business email, travel, finance, HR, manufacturing, healthcare.

### Format Part 5 — Incomplete Sentences

```markdown
**Q1.** The new product launch has been __________ until further notice.
A. postpone
B. postponing
C. postponed
D. postponement

<details><summary>Answer</summary>C — "has been" + past participle (passive voice).</details>
```

### Format Part 6 — Text Completion
1 texte (3-5 paragraphes) avec 4 trous numérotés. Choix A-B-C-D pour chacun.
Vérifier cohérence textuelle, pas seulement la phrase isolée.

### Format Part 7 — Reading Comprehension

```markdown
**Passage (advertisement):**
[Texte 100-300 mots]

**Q1.** What is the main purpose of the advertisement?
A. To sell a product
B. To announce a job opening
C. To invite to an event
D. To request a refund

<details><summary>Answer</summary>B — paragraph 2 says "We are hiring..."</details>
```

### Vocabulary drills
- Listes **thématiques** (business, office, travel, finance, manufacturing, healthcare, marketing, HR).
- 15-20 mots par session : définition EN courte, synonymes, exemple en phrase.
- Drill : mot ↔ définition, mot ↔ synonyme, fill-in-the-blank.

### Grammar drills — patterns récurrents TOEIC
1. **Tenses** : present perfect vs simple past, past perfect.
2. **Conditionals** : 1st, 2nd, 3rd, mixed.
3. **Passive voice** : especially business contexts ("decisions have been made").
4. **Prepositions** : in / on / at (time + place), by / until, for / since.
5. **Relative clauses** : who / which / that, defining vs non-defining.
6. **Modal verbs** : must, should, can, may, might, ought to.
7. **Verb forms** : gerund vs infinitive (`stop doing` vs `stop to do`).
8. **Comparatives** : `as ... as`, `the more ... the more`.

### Stratégies par partie
- **Part 1** : éliminer les options qui contiennent un mot non visible sur l'image.
- **Part 2** : attention aux pièges phonétiques (their / there / they're, weather / whether).
- **Part 3-4** : lire les questions AVANT que l'audio commence (skim 30s).
- **Part 5** : reconnaître le pattern → temps verbal, voix, partie du discours, accord.
- **Part 6** : lire le paragraphe entier (cohérence textuelle prime sur la phrase isolée).
- **Part 7** : skim → scan → read in detail. Ne pas tout lire en détail dès le début.

### Gestion du temps (Reading)
- 75 min / 100 questions ≈ **45s par question** en moyenne.
- Part 5 : ~25s/question (rapide).
- Part 6 : ~40s/question.
- Part 7 : ~60s/question (sauf multiple passages plus longs).
- Si bloqué > 1 min sur une question → **marquer et passer**.

### Analyse d'erreurs (après test blanc)
1. Recenser les questions ratées.
2. Catégoriser : grammaire (lequel), vocab (thème), compréhension (skim/scan/detail), temps (bloqué trop longtemps).
3. Sortie : tableau de patterns → priorités de révision.

## Stockage
Par défaut : `C:\Users\yohan\Documents\Formations\TOEIC\<date>-<topic>.md`.

Convention de naming :
- `2026-05-21-grammar-conditionals-lvl700.md`
- `2026-05-21-mock-test-1.md`
- `2026-05-21-vocab-business-email.md`
- `2026-05-21-error-analysis-mock1.md`

Créer le dossier `Documents/Formations/TOEIC/` si absent (le projet n'est pas dans le registre actuellement).

## Plan de révision type (8 semaines avant exam)
| Semaine | Focus |
|---|---|
| **S1** | Diagnostic — test blanc complet + auto-évaluation parties faibles. |
| **S2** | Listening Part 1 + Part 2 (drills + stratégie). |
| **S3** | Listening Part 3 + Part 4 (skim questions, prise de notes mentales). |
| **S4** | Reading Part 5 (grammaire pattern recognition). |
| **S5** | Reading Part 6 (cohérence textuelle). |
| **S6** | Reading Part 7 (skim/scan strategy). |
| **S7** | Vocabulaire thématique intensif. |
| **S8** | 2 tests blancs en conditions réelles + analyse erreurs. |

## Standards
- **Contenu exercices** : **anglais** (l'examen est en EN).
- **Méta / stratégie / explication / corrections** : français (alignement prefs Yohan).
- **Pas de fuite de matériel TOEIC officiel** copyrighted. Générer des questions **originales dans le style TOEIC**, jamais copier d'annales.
- **Pas de notes / résultats individuels** stockés en mémoire Claude Code (cf. CLAUDE.md §4.5 — données académiques sensibles).

## Anti-patterns
- Apprendre par cœur des "annales TOEIC" sans comprendre la grammaire sous-jacente.
- Faire 10 tests blancs sans analyser les erreurs (correction superficielle).
- Réviser uniquement le listening (le reading représente 50% du score).
- Ignorer la stratégie temps (échec fréquent en Part 7 par manque de temps).
- Drills déconnectés du format réel (apprendre du vocab sans contexte business).

## Exemples d'invocation
- "Génère 10 questions Part 5 grammar (passive voice + tenses) niveau 700."
- "Crée une fiche vocabulaire 20 mots thème *office equipment*."
- "Génère un test blanc Part 6 (4 textes × 4 trous) niveau intermédiaire."
- "Voici mes 15 erreurs du test blanc → analyse les patterns et propose un plan de 2 semaines."
- "Plan de révision sur 8 semaines, examen prévu le <date>, niveau actuel ~600 → objectif 800."
