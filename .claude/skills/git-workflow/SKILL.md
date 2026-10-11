---
name: git-workflow
description: Git workflow strategies — branching models (Git Flow, GitHub Flow, trunk-based), conventional commits, rebase vs merge, conflict resolution, hooks, hotfix flow. Use when structuring branching for kryptosphere projects, resolving merge conflicts, planning a release, or onboarding contributors.
---

# Workflow Git

## Quand l'utiliser
- Choisir / structurer un modèle de branches pour un projet.
- Conflit non trivial à résoudre.
- Hotfix urgent en prod.
- Onboarding d'un contributeur KS sur ton repo.
- Rentrée académique : standardiser le flow sur les nouveaux projets.

## Méthode

### Modèle recommandé : **GitHub Flow** (simple, adapté solo/petite équipe)
- `main` = toujours déployable.
- `feat/<slug>`, `fix/<slug>`, `chore/<slug>` → PR → merge dans `main`.
- Pas de `develop` (sauf si vraiment besoin de staging long-lived).
- Tags pour les releases : `v1.2.3`.

Pour KS : GitHub Flow par défaut. Git Flow seulement si plusieurs releases parallèles maintenues.

### Conventional Commits (cf. règle 03)
- `feat(api): add auth route`
- `fix(ui): correct dropdown z-index`
- `refactor(db): extract migration helper`
- `chore: bump deps`
- Breaking change : `feat(api)!: ...` ou footer `BREAKING CHANGE: ...`.

### Rebase vs Merge
- **Local / WIP** : rebase autorisé pour nettoyer l'historique avant push.
- **PR feature** : merge avec **squash** par défaut (1 commit propre dans main).
- **Branche partagée** : jamais de rebase (`git push --force` interdit).
- **Main / Dev** : jamais de force push (cf. règles).

### Conflits
1. `git pull --rebase origin main` avant push d'une feature longue.
2. Conflit : ouvrir chaque fichier, comprendre les 2 intents, fusionner manuellement.
3. `git rebase --continue` après chaque résolution.
4. `git rebase --abort` si tu te perds — reset, restart.

### Hotfix en prod
1. Brancher depuis tag prod : `git checkout -b hotfix/<slug> v1.2.3`.
2. Fix + test.
3. PR vers `main` → merge → tag `v1.2.4` → deploy.
4. Cherry-pick vers les autres branches longues si applicable.

### Hooks
- **Pre-commit** : lint + format (Husky + lint-staged).
- **Commit-msg** : valider conventional commit (`commitlint`).
- **Pre-push** : tests rapides.
- Jamais `--no-verify` (sauf cas exceptionnel documenté).

### Repos non-Git de Yohan
- `PA` et `3rd-Trimestre` actuellement hors Git → faire `git init` + remote privé (cf. [SOP Rentrée académique](../../../references/sops/rentree-academique.md)).

## Standards
- [references/standards.md § Transverse — Conventional Commits + Git workflow](../../../references/standards.md).
- `.claude/rules/03-code-quality-strict.md`.

## Anti-patterns
- `git push --force` sur `main`.
- Commits "wip", "fix stuff" mergés tels quels.
- Branches longues sans rebase régulier (conflits monstre à la fin).
- Skip des hooks sans raison.

## Exemples
- Setup `husky` + `lint-staged` + `commitlint` sur `kryptosphere-website`.
- Hotfix sur le site KS avant un event : flow complet.
