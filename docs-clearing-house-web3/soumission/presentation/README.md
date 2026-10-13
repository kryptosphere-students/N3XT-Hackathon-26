# Présentation finale Cendro

Cadrage avant de coder la présentation HTML, avec la skill `frontend-slides`.

| Fichier | Contenu |
|---|---|
| [01-cadrage.md](01-cadrage.md) | Contexte, objectifs, critères du jury, densité, démo, contraintes, ce qu'on ne dit pas |
| [02-branding.md](02-branding.md) | Identité Cendro, ton, système graphique, trois directions visuelles, palette, typographie, mouvement |
| [03-plan-slides.md](03-plan-slides.md) | 11 slides en 5 minutes, puis 7 annexes pour les questions, avec textes, visuels, oral et sources |

## Version actuelle : `cendro-pitch.html` (V1)

Direction visuelle C, « Settlement Desk ». 19 slides : 11 pour les 5 minutes, puis un intercalaire et 7 annexes pour les questions. Un seul fichier, polices embarquées (fonctionne sans réseau), captures recadrées dans `assets/`.

| Touche | Action |
|---|---|
| → ou espace / ← | Slide suivante / précédente |
| Un numéro puis Entrée | Aller à une slide (annexes : 13 à 19) |
| N | Notes d'oral en surimpression (répétition) |
| P | Fenêtre présentateur pour un second écran : notes, slide suivante, chrono |
| E | Modifier le texte dans le navigateur ; Cmd+S télécharge le fichier modifié |
| F | Plein écran |

Ajouter `?static` à l'adresse désactive les animations (captures, export PDF).

## Étapes

1. **Valider le cadrage** (ces trois fichiers).
2. **Aperçus** : trois slides de titre, une par direction visuelle (A, B, C), à comparer dans le navigateur.
3. **Choix** d'une direction.
4. **Génération** de la présentation complète : un fichier `cendro-pitch.html` dans ce dossier.
5. **Vérification** à 1920 × 1080, 1280 × 720 et sur un téléphone : aucun texte qui déborde, aucun bloc qui en chevauche un autre.
6. **Répétition** chronométrée, puis export PDF de secours.

## À trancher avant l'étape 2

- [ ] Répartition des slides entre Louis et Mark (proposée dans `03-plan-slides.md`).
- [ ] Démo en direct ou non pendant les 5 minutes (`01-cadrage.md`, section 6).
- [ ] Signature « Signed by people. Settled by code. » à garder ou à remplacer.
- [ ] Captures d'écran à regénérer avec l'en-tête Cendro.
