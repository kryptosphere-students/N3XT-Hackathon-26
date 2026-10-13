# Cadrage de la présentation finale

Base : l'état du dépôt au 13 octobre 2026 (commit `2b9045f`), le README racine, `DECISIONS.md` (D1 à D13), `guide-oral.md`, `video-script.md`. Rien dans la présentation ne doit dire plus que ce que le code fait.

## 1. Le contexte

| Élément | Valeur |
|---|---|
| Moment | Finale du hackathon Ledger N3XT, Ledger HQ Paris, 16 octobre, 15:00 |
| Format | 10 min : **5 min de présentation**, puis 5 min de questions |
| Présentateurs | Deux, présents dans la salle. Celui qui pitche répond au jury |
| Jury | Ian Rogers (Chief Human Agency Officer, Ledger), Guillaume Mathias (VP Product, Ledger), Joshua Mo (DevRel Lead, Venice), Drake Breeding (Director Ecosystem, Arc, Circle) |
| Langue | Anglais, à l'écran comme à l'oral |
| Support | Un seul fichier HTML, plein écran, navigation au clavier, format 16:9 fixe |

## 2. Ce que la présentation doit faire

En 5 minutes, le jury doit retenir trois choses :

1. **Le problème** : qui a approuvé cet ordre ? Aujourd'hui, la preuve est dans un email.
2. **La réponse** : l'agent lit, le code vérifie, l'humain signe sur son Ledger, en texte lisible. Tout ou rien en chaîne.
3. **La preuve** : ça tourne, les contrats sont déployés, l'email piégé est refusé avant toute signature.

Phrase à faire répéter : **« Signed by people. Settled by code. »**

## 3. Ce que le jury regarde, et où on y répond

| Critère (poids) | Slide qui y répond |
|---|---|
| Exécution technique (25 %) | Flux d'un ordre, règlement, preuves et limites |
| Utilité pour Ledger (20 %) | Ledger dans le produit : DMK, Key Ring, signatures lisibles |
| Innovation (20 %) | La frontière agent / code / humain, l'email piégé |
| Expérience utilisateur (15 %) | Le moment démo : ce que la Flex affiche |
| Nouveaux cas d'usage pour Ledger (10 %) | Pour qui : dépositaires et administrateurs de fonds |
| Clarté et documentation (10 %) | Le rythme, les limites dites par nous, le dépôt |

Le jury rassemble deux profils de Ledger (agence humaine, produit), un profil DevRel, et un profil Circle (stablecoins, monnaie de règlement). Deux angles à soigner : la **frontière humain / agent** (Ian Rogers) et le **cash de règlement** (Drake Breeding).

## 4. Mode de densité (skill frontend-slides)

**Faible densité, portée par l'oral.** Une idée par slide, gros texte, une à trois lignes. Le détail est dans les slides d'annexe, montrées seulement pendant les questions.

## 5. Durée et répartition

11 slides principales en 5:00, puis 7 slides d'annexe pour les questions. Répartition proposée : Louis pour le problème, le marché et la conclusion ; Mark pour le produit, la démo et la technique. Détail dans `03-plan-slides.md`.

## 6. La démo dans les 5 minutes

**Recommandation : pas de démo en direct dans les 5 minutes.** Un vrai cycle demande 11 gestes sur la Flex et des attentes de transaction. On montre à la place les moments clés en captures animées, slides 6 et 7.

Option à trancher : une démo en direct de 45 secondes (l'email piégé seul, sans Flex) si le réseau de la salle le permet, ou pendant les questions si le jury la demande. La vidéo de 2 min 50 reste le filet de sécurité.

## 7. Contraintes techniques du fichier

- Un seul fichier HTML, CSS et JS inclus, aucune dépendance npm (règle de la skill).
- Scène fixe 1920 × 1080, mise à l'échelle sur tout écran, sans réorganisation du contenu.
- Navigation : flèches, espace, clic, et un mode présentateur avec les notes.
- **Polices disponibles hors ligne.** Le wifi de la salle n'est pas garanti : les polices sont embarquées dans le fichier, pas chargées depuis Google Fonts le jour J.
- Captures d'écran incluses dans le fichier ou à côté de lui, en chemins relatifs.
- `prefers-reduced-motion` respecté.
- Export PDF de secours (script de la skill), à apporter sur une clé USB.

## 8. Ce qu'on ne dit pas

- Aucun chiffre non mesuré : pas de taille de marché, pas de prix, pas de gain en euros.
- Pas de « partenaire » ni de « client » : CACEIS est un exemple du segment, sans relation.
- Pas de « dépositaire central » pour parler de Cendro : c'est un moteur de règlement.
- Pas de promesse sur la vérification des signatures dans le contrat : elle existe sur une branche, elle n'est pas déployée.

## 9. Prérequis avant de coder

- [ ] Regénérer les captures d'écran avec le nouvel en-tête Cendro (`npm run screenshots`). Les actuelles affichent encore « Clearing House ».
- [ ] Confirmer la répartition des slides entre Louis et Mark.
- [ ] Trancher la démo en direct (section 6).
- [ ] Choisir une des trois directions visuelles (`02-branding.md`), après les aperçus.
