# Plateforme de marque Cendro

## 1. Identité

| Élément | Choix |
|---|---|
| Nom | **Cendro** |
| Sous-titre, toujours présent | **settlement engine for tokenized funds** |
| Équipe | Team Kryptosphere |
| Signature | **Signed by people. Settled by code.** |
| Promesse | Every order a person approved, provably. Every settlement, all or nothing. |
| Ce que Cendro n'est pas | Un dépositaire central, un custodian, un agent qui décide |

## 2. Positionnement

Cendro se place entre l'email d'un gérant et le règlement en chaîne. Il ne remplace ni l'administrateur du fonds ni le dépositaire : il leur donne une preuve signée de chaque décision humaine et un règlement atomique.

Trois rôles, toujours dans cet ordre, toujours avec les mêmes mots :

| Rôle | Verbe | Couleur de rôle |
|---|---|---|
| The agent | reads | neutre (gris) |
| The code | checks | accent froid |
| The person | signs | accent chaud, celui de la marque |

## 3. Ton

- Phrases courtes, verbes au présent, sans superlatif.
- Des faits mesurés plutôt que des adjectifs : « 6,300 net instead of 14,700 », pas « massive savings ».
- Les limites dites par nous, sur une slide à part.
- Les termes techniques gardent leur nom exact (EIP-191, DvP, NAV) mais sont expliqués une fois.

## 4. Système graphique

### Le symbole

Deux formes qui se referment l'une sur l'autre : les parts d'un côté, le cash de l'autre. Elles ne se touchent que si les deux sont présentes. C'est la livraison contre paiement, tout ou rien.

Le symbole sert de logo (à gauche du mot Cendro) et d'animation clé : sur la slide du règlement, les deux formes se rejoignent quand le lot est réglé, et restent écartées pour l'email piégé.

### Les éléments récurrents

- **Le cadre « Flex »** : un rectangle aux coins arrondis qui imite un écran d'appareil, utilisé chaque fois qu'on montre un texte signé. Pas de photo ni de logo de Ledger.
- **Le hash** : en police mono, raccourci (`0xe619…af39`), utilisé comme ornement de preuve.
- **La ligne de flux** : un trait fin qui relie email, brouillon, contrôle, signature et règlement, et qui progresse d'une slide à l'autre.

### Ce qu'on s'interdit

- Le logo, la police ou la couleur de marque de Ledger : on montre le produit, on n'imite pas la marque.
- Les dégradés violets, les icônes génériques, les fonds de « blockchain » en réseau de points.
- Plus d'une couleur vive par slide.

## 5. Trois directions visuelles à comparer

Conformément à la skill `frontend-slides`, je génère un aperçu de la slide de titre dans chacune de ces trois directions. Tu choisis sur pièce.

| | A. Swiss Ledger | B. Signal | C. Settlement Desk |
|---|---|---|---|
| Source | Préréglage « Swiss Modern » de la skill | Modèle « signal » de la skill (institutionnel, sobre) | Création sur mesure |
| Fond | Blanc pur | Clair et sombre alternés | Encre presque noire |
| Accent | Rouge vif unique | Accent unique, discret | Vert « réglé » et rouge « refusé » |
| Typographie | Grotesque suisse, grands titres | Serif éditorial et sans-serif | Serif de caractère, sans-serif sobre, mono pour les hashs |
| Sensation | Clair, rigoureux, très lisible | Crédible, posé, « comité d'investissement » | Salle des marchés de nuit, précis, mémorable |
| Risque | Peut paraître froid | Peut paraître trop sage pour un hackathon | Plus dur à lire sur un mauvais projecteur |

Ma préférence va à **C. Settlement Desk**. C'est la plus reconnaissable, et le symbole de livraison contre paiement y vit le mieux. Il faudra vérifier le contraste sur le projecteur de la salle. B est le choix sûr si le jury paraît très institutionnel.

## 6. Palette proposée pour la direction C

| Rôle | Nom | Hex | Usage |
|---|---|---|---|
| Fond | Ink | `#0B0F14` | Fond des slides |
| Surface | Slate | `#151B23` | Cartes, cadre Flex |
| Texte | Bone | `#EDE8DF` | Texte principal |
| Texte secondaire | Fog | `#8A93A0` | Légendes, l'agent |
| Accent marque | Seal | `#F2A65A` | La personne qui signe, le symbole |
| Réglé | Verdigris | `#3FBF9F` | Le code qui vérifie, un lot réglé |
| Refusé | Cinnabar | `#E5484D` | Un refus du mandat, l'email piégé |

Tous les couples texte / fond seront vérifiés à un contraste d'au moins 4,5:1.

## 7. Typographie proposée pour la direction C

| Rôle | Police | Source |
|---|---|---|
| Titres | Zodiak (serif de caractère) | Fontshare |
| Texte | Switzer (sans-serif sobre) | Fontshare |
| Hashs, adresses, chiffres de preuve | JetBrains Mono | Google Fonts |

Les trois polices seront embarquées dans le fichier, pour fonctionner sans réseau le jour J.

## 8. Mouvement

- Une entrée orchestrée par slide : le titre, puis les éléments en cascade (délais de 80 à 120 ms).
- Le symbole qui se referme sur la slide du règlement, et qui reste ouvert sur la slide de l'email piégé.
- La ligne de flux qui avance d'une étape par slide.
- Pas d'animation pendant que l'orateur parle d'un chiffre.
- Tout est désactivé avec `prefers-reduced-motion`.
