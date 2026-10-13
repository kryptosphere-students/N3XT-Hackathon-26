# Plan slide par slide

Texte à l'écran et oral en anglais. Les rubriques « À dire » ci-dessous résument l'intention en français ; le texte exact à dire, en anglais, est dans les notes de `cendro-pitch.html` (touche N ou P). Durées cumulées sur 5:00. L : Louis, M : Mark.

Chaque chiffre vient du dépôt ; sa source est indiquée.

## Partie principale, 5 minutes (V2)

V2 du 13 octobre : ajout de la vision marché (chaîne de valeur, slides 2 et 5), tirée de l'étude « Veille stratégique 2026 : la tokenisation de parts de fonds » (février 2026). La slide « Why now » est fusionnée dans la slide Problème pour tenir les 5 minutes.

| # | Slide | Qui | Temps | Intention |
|---|---|---|---|---|
| 1 | Title | L | 0:00 à 0:15 | Cendro, settlement engine for tokenized funds, Team Kryptosphere |
| 2 | The market today | L | 0:15 à 0:50 | La chaîne de valeur actuelle en 7 acteurs et 3 temps (J, J+1, J+2/3), trois frictions, le dépositaire du fonds qui supervise tout |
| 3 | Problem | L | 0:50 à 1:15 | Qui a approuvé cet ordre ? Un email. Et un agent IA qui lit cet email peut être trompé |
| 4 | What Cendro does | L | 1:15 à 1:35 | L'agent lit, le code vérifie, la personne signe sur un Ledger |
| 5 | Where Cendro plugs in | L | 1:35 à 1:55 | La même chaîne : ordres signés à J, NAV inchangée (hashée), netting et DvP dès l'approbation ; le dépositaire est notre acheteur |
| 6 | The path of one order | M | 1:55 à 2:25 | Six étapes, du mail au `settle(lot)`, et le texte affiché sur la Flex |
| 7 | The trapped email | M | 2:25 à 2:50 | Deux couches : l'agent ignore la consigne, le mandat refuse quand même |
| 8 | Settlement | M | 2:50 à 3:20 | 14 700 → 6 300 de cash (−57 %), 11 s de l'ordre au règlement, une transaction |
| 9 | Ledger, inside the product | M | 3:20 à 3:45 | DMK (texte lisible), Key Ring, Clear Signing en prochaine étape |
| 10 | Who it is for | L | 3:45 à 4:20 | Logos CACEIS, BNP Paribas Securities Services (initiatives 2025), SGSS (à qualifier) ; licence, intégration, frais par instruction |
| 11 | Proof and limits | M | 4:20 à 4:45 | 115 tests, 3 contrats vérifiés ; ce qu'on assume |
| 12 | Close | L | 4:45 à 5:00 | Signed by people. Settled by code. |

### Le diagramme de chaîne de valeur (slides 2 et 5)

Simplification de la slide 14 de l'étude (modèle traditionnel) :

| # | Acteur | Rôle simplifié | Temps |
|---|---|---|---|
| 01 | Investor & distributor | Passe l'ordre, KYC chez le distributeur | J |
| 02 | Account keeper | Contrôle l'ordre, bloque le cash | J |
| 03 | Transfer agent | Centralise avant le cut-off, à cours inconnu | J |
| 04 | Fund admin | Calcule la NAV | J+1 |
| 05 | Asset manager | Valide la NAV | J+1 |
| 06 | Transfer agent | Matching, netting, mise à jour du registre | J+2/3 |
| 07 | Central securities depository | DvP parts contre cash (ex. T2S) | J+2/3 |

Bande transverse : le dépositaire du fonds, qui contrôle les flux, la NAV et les limites du prospectus. Frictions reprises de la slide 16 de l'étude (preuve d'approbation, NAV quotidienne réconciliée, trois registres et risque de contrepartie). La plateforme d'acheminement des ordres est fondue dans l'agent de transfert pour garder sept acteurs.

### Sources des logos (slide 10)

- CACEIS : infrastructure et plateforme d'ordres de la part tokenisée du fonds monétaire d'Amundi, première souscription le 4 novembre 2025 (étude, slide 27).
- BNP Paribas Securities Services : agent de transfert de la part tokenisée du fonds monétaire de BNP Paribas AM sur Allfunds Blockchain, annoncée le 22 mai 2025 (étude, slide 27).
- Société Générale Securities Services : aucune initiative trouvée dans l'étude, d'où « To qualify ». Le logo est celui du groupe Société Générale.

## Annexes, pour les questions

Affichées seulement si une question les appelle. Accessibles en tapant le numéro de slide (14 à 20) puis Entrée.

| # | Titre | Contenu | Question qui l'appelle |
|---|---|---|---|
| A1 | Who signs what | Le tableau du README | « Qu'est-ce que l'agent peut faire seul ? » |
| A2 | Why plain text and not EIP-712 | Le test du 11 octobre, l'erreur `6a80`, le choix D6 | « Pourquoi pas le Clear Signing ? » |
| A3 | The escrow and the lot hash | `settle(lot)`, tout ou rien, `LotSettled`, le hash identique des deux côtés | « Le contrat vérifie-t-il les signatures ? » |
| A4 | The NAV | Fichier de l'administrateur fictif, calcul, hash des entrées et du résultat | « D'où vient le prix ? » |
| A5 | The agent's guardrails | Un seul outil, liste blanche, aucun montant, l'email piégé | « Et si le modèle est compromis ? » |
| A6 | What a pilot needs | Vérification en chaîne, descripteurs ERC-7730, vraie NAV, réseau choisi avec le client, audit | « Qu'est-ce qui manque pour la production ? » |
| A7 | Building on Ledger | Les quatre points du retour développeur | « Comment s'est passé le travail avec nos outils ? » |

## Captures utilisées

| Fichier | Slide |
|---|---|
| `screenshots/05-trapped-email.png` | 6 |
| `screenshots/07-lot-settled.png` | 7 |
| `screenshots/03-agent-draft.png` | 5 (en option) et A5 |
| `screenshots/08-instant-settled.png` | A3 |

À regénérer avec l'en-tête Cendro avant d'être intégrées.
