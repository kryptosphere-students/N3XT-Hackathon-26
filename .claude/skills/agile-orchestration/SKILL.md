---
name: agile-orchestration
description: Break down projects into Epics, User Stories, and Subtasks using lean Agile practices. Maintain a backlog in Markdown (or GitHub Issues), plan Kanban or sprint flow, write Gherkin acceptance criteria, prioritize with MoSCoW. Use when starting a new project (PA Actify, kryptosphere-api refonte), splitting a large feature, building a sprint plan, grooming a backlog, or planning a release.
---

# Agile Orchestration

## Quand l'utiliser
- Démarrer un nouveau projet → définir les Epics et stories initiales.
- Splitter une grosse feature en stories actionnables.
- Grooming d'un backlog (refining, re-priorisation).
- Planifier un sprint ou une release.
- Préparer une soutenance / livraison (vue d'avancement claire).
- Onboarding d'un contributeur (visibilité immédiate sur le reste à faire).

## Hiérarchie (3 niveaux)

```
Epic (E-XXX)        ← gros chunk de valeur, 2-8 semaines, 3-15 stories
  └── Story (S-XXX) ← unité de valeur livrable, 1-5 jours, 2-8 subtasks
        └── Subtask ← action concrète, ≤ 4h, checklist dans la story
```

Pas d'Initiative (4e niveau) sauf programme multi-projets. Tu n'en as pas besoin.

## Format Story (INVEST)

Une story doit être :
- **I**ndependent — peu de dépendances bloquantes
- **N**egotiable — discutable, pas un contrat figé
- **V**aluable — apporte une valeur utilisateur claire
- **E**stimable — taille mesurable
- **S**mall — découpable, ≤ 1 semaine
- **T**estable — critères d'acceptation vérifiables

### Template Story (Markdown)
Fichier : `projects/<slug>/stories/S-XXX-<slug-court>.md`

```markdown
---
id: S-001
epic: E-001
title: <Titre court actionnable>
status: backlog | ready | in-progress | review | done
priority: must | should | could | wont   (MoSCoW)
estimate: XS | S | M | L | XL            (T-shirt sizing)
owner: yohan
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## User story
En tant que **<rôle>**, je veux **<action>**, afin de **<bénéfice>**.

## Critères d'acceptation (Gherkin)
- **Étant donné** <contexte initial>
- **Quand** <action effectuée>
- **Alors** <résultat attendu observable>

(répéter par scénario)

## Subtasks
- [ ] <Action concrète ≤ 4h>
- [ ] <...>

## Dépendances
- Bloque : S-XXX, S-YYY
- Bloqué par : S-ZZZ

## Notes / liens
- Lien vers décision : `decisions/log.md` (si applicable)
- Lien vers fichier code, doc, maquette
```

## Format Epic (plus léger)

Fichier : `projects/<slug>/stories/E-XXX-<slug-court>.md`

```markdown
---
id: E-001
title: <Titre Epic>
status: backlog | in-progress | done
target: YYYY-MM-DD (deadline ou jalon)
---

## Objectif
<1-2 phrases : la valeur métier ou technique livrée à la fin de l'epic>

## Stories
- [ ] S-001 — <titre>
- [ ] S-002 — <titre>
- [ ] S-003 — <titre>

## Critères de complétion
<Quand cet Epic est-il considéré "Done" ?>
```

## Stockage et tracking

### Par défaut : Markdown dans `projects/<slug>/`
Cohérent avec l'architecture Big_Boss_House. Versionable Git.

```
projects/<slug>/
├── README.md              (tracking méta — jalons, points ouverts)
├── stories/
│   ├── E-001-<slug>.md    (Epic)
│   ├── S-001-<slug>.md    (Story)
│   ├── S-002-<slug>.md
│   └── ...
└── (optionnel) board.md   (vue Kanban condensée)
```

### Alternative : GitHub Issues
Si le projet a un repo Git actif (cas `kryptosphere-api`) :
- Issues GitHub avec labels `epic`, `story`, `priority:must|should|could`, `size:XS..XL`, `status:ready|in-progress|review`.
- Milestones GitHub = Epics ou releases.
- Projects GitHub (board Kanban) = vue.
- Utiliser le CLI `gh` (`gh issue create`, `gh issue edit`, `gh issue list`).

Choisir UNE source de vérité par projet, pas les deux en parallèle.

## Workflow

### Kanban (défaut)
États : `backlog → ready → in-progress → review → done`.
Pas de sprint, flux continu. WIP limit recommandée : 2-3 stories `in-progress` en solo.

### Scrum (si sprints + équipe)
- Sprints de 1-2 semaines.
- `sprint-N.md` listant les stories choisies.
- Daily standup (skill `engineering:standup` complémentaire).
- Vélocité = somme des estimations XS/S/M/L/XL des stories `done` du sprint passé.

Yohan = solo principalement → Kanban par défaut. Scrum uniquement si livrable rythmé (PA avec jalons stricts).

## Méthode pas-à-pas

### Initialisation projet
1. **Lire** `projects/<slug>/README.md` + `PA/CLAUDE.md` (ou équivalent) + mémoire `project_<slug>.md`.
2. **Capter l'intent** : objectif global, deadline, contraintes.
3. **Identifier 3-7 Epics** couvrant la valeur totale du projet (ni trop fins, ni trop gros).
4. **Pour chaque Epic, lister les Stories INVEST** (3-15 par epic typique).
5. **Prioriser** avec MoSCoW : Must / Should / Could / Won't.
6. **Estimer** en T-shirt sizing (XS = ½ jour, S = 1-2j, M = 3-5j, L = 1-2 sem, XL = à découper).
7. **Créer les fichiers** `stories/E-XXX-*.md` et `stories/S-XXX-*.md`.
8. **Mettre à jour** `projects/<slug>/README.md` jalons.
9. **Consigner** la décision de découpage dans `decisions/log.md` si non triviale.

### Grooming périodique (mensuel)
1. Re-prioriser le backlog (les Must doivent rester top).
2. Détailler les Should/Could si vont passer à Must.
3. Splitter les XL en plusieurs L.
4. Marquer Won't ce qui n'a plus de sens → archiver vers `archives/`.

### Démarrage d'une story
1. Status `backlog → ready` quand : critères d'acceptation OK, pas de bloqueur, estimable.
2. Status `ready → in-progress` quand on commence (max 2-3 en parallèle).
3. Cocher les subtasks au fur et à mesure.
4. Status `in-progress → review` quand le code passe les tests + lint zéro warning.
5. Status `review → done` quand mergé + déployé + vérifié.

## Standards
- [../../../references/standards.md § Transverse — Conventional Commits + Git workflow](../../../references/standards.md).
- [../../../references/sops/audit-prerelease.md](../../../references/sops/audit-prerelease.md) avant de marquer une release `done`.
- `.claude/rules/05-no-overengineering.md` : pas de subtask spéculative ; si tu hésites → pas dans le backlog.

## Intégration avec l'écosystème Big_Boss_House
- **Tracking méta** : `projects/<slug>/README.md` (jalons, points ouverts) + `stories/` (détail).
- **Décisions archi importantes** : `decisions/log.md`.
- **Deadlines** : `references/calendar.md` (synchroniser avec jalons Epic).
- **SOPs** : si une story récurrente correspond à une SOP existante (ex : audit pré-release), pas réinventer — référencer.
- **Skills custom prioritaires** par projet : section déjà présente dans le `CLAUDE.md` projet.

## Anti-patterns
- Stories qui décrivent du **comment** (technique) au lieu du **quoi** (valeur). Mauvais : "Ajouter un index Postgres". Bon : "Recherche événements < 500ms quand backlog > 1000 events" (et l'index est une subtask).
- Pas de critères d'acceptation → story non testable, jamais finie.
- Epic perpétuel ("Refacto général") → split en epics finis avec date cible.
- Subtask > 1 jour → c'est une story qui se cache.
- Backlog "fourre-tout" sans priorisation → re-grooming mensuel obligatoire.
- Story commencée avec des dépendances bloquantes non résolues.

## Exemples appliqués

### Exemple 1 — PA Actify (épics suggérés)
- **E-001 — Backend API_ACTIFY_NODE** : routes core, validation, persistance.
- **E-002 — Frontend FRONT_ACTIFY** : pages clés + intégration API.
- **E-003 — Smart contracts SMARTCONTRACTS_ACTIFY** : design + tests + déploiement testnet.
- **E-004 — Documentation soutenance** : cahier des charges v2, README, slides.
- **E-005 — Infrastructure & déploiement** : docker-compose prod, monitoring basique.

Story exemple sous E-001 :
> **S-001 — Inscription utilisateur via email/password**
> En tant qu'utilisateur, je veux créer un compte avec email/password, afin d'accéder aux fonctionnalités personnalisées.
> Étant donné un email non utilisé, Quand je soumets le formulaire, Alors un compte est créé et un email de confirmation est envoyé.
> Subtasks : route POST /auth/signup, validation Zod, hash argon2, modèle Mongo/Prisma, test d'intégration, doc OpenAPI.

### Exemple 2 — kryptosphere-api refonte (depuis ton tracking existant)
Les 8 jalons J0-J7 dans `projects/ks-api-refonte/README.md` deviennent des Epics. Chaque Epic se décompose en stories.

Exemple : **E-002 — Schema Prisma cible + migration Mongo→Postgres** (= J1 du tracking) :
- S-010 — Introspect les modèles Mongoose existants (1 fichier inventaire).
- S-011 — Designer le schema Prisma cible (relationnel équivalent + index).
- S-012 — Script de migration idempotent (read Mongo, transform, upsert Postgres).
- S-013 — Tests de la migration sur un dump dev.
- S-014 — Documentation du mapping et des choix de design.
