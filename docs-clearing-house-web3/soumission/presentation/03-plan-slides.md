# Plan slide par slide

Texte à l'écran et oral en anglais. Les rubriques « À dire » ci-dessous résument l'intention en français ; le texte exact à dire, en anglais, est dans les notes de `cendro-pitch.html` (touche N ou P). Durées cumulées sur 5:00. L : Louis, M : Mark.

Chaque chiffre vient du dépôt ; sa source est indiquée.

## Partie principale, 5 minutes

### 1. Title, 0:00 à 0:15 (L)

- **À l'écran** : le symbole, puis « Cendro », puis « settlement engine for tokenized funds ». En bas : « Team Kryptosphere · Ledger N3XT 2026 ».
- **Visuel** : les deux formes du symbole se referment lentement.
- **À dire** : « We are Kryptosphere. This is Cendro, a settlement engine for tokenized funds. »

### 2. Problem, 0:15 à 0:50 (L)

- **À l'écran** : « Who approved this order? » en grand. En dessous, trois étapes barrées en cascade : « Email → Retyped by a back office → Settled T+2 ».
- **Visuel** : un faux fil d'email flou derrière la question.
- **À dire** : les ordres arrivent par email, sont ressaisis, réglés deux ou trois jours plus tard. La preuve qu'un gérant a approuvé un ordre est un email, pas une signature vérifiable.
- **Source** : README, Problem.

### 3. Why now, 0:50 à 1:10 (L)

- **À l'écran** : deux lignes. « Tokenized units move in seconds. » / « Approval still sits in an inbox. » Puis, en rouge : « And now an AI agent reads that inbox. »
- **À dire** : les parts tokenisées existent, mais l'approbation n'a pas changé. Un agent IA qui lit les emails peut être trompé par l'email qu'il lit.

### 4. What Cendro does, 1:10 à 1:35 (L)

- **À l'écran** : trois colonnes, dans cet ordre, avec leur couleur de rôle. « The agent reads. » / « The code checks. » / « The person signs, on a Ledger. »
- **En dessous** : « Settlement: units and cash move together, or not at all. »
- **À dire** : c'est la frontière que Ledger demande de nommer. Cendro n'est pas un dépositaire central : c'est un moteur de règlement.

### 5. The path of one order, 1:35 à 2:10 (M)

- **À l'écran** : la ligne de flux en cinq étapes. Email → Draft (agent, one tool) → Mandate check (code) → Order signed on the Flex → Lot approved → `settle(lot)` on Base Sepolia.
- **Visuel** : chaque étape s'allume à son tour. Le cadre Flex montre le texte de l'ordre : « Subscribe 100 units ».
- **À dire** : l'agent n'a qu'un outil et ne calcule aucun montant. Le code vérifie le mandat signé. Chaque signature humaine est un texte lisible sur l'appareil.
- **Source** : `guide-oral.md`, section 1.

### 6. The trapped email, 2:10 à 2:40 (M)

- **À l'écran** : la capture `05-trapped-email.png`, avec l'encadré rouge « refused, above the signed cap ». Titre : « Fooled agent. Nothing to sign. »
- **Visuel** : le symbole reste ouvert. Le cadre Flex est vide, marqué « The Flex is never asked ».
- **À dire** : deux couches. L'agent ignore la consigne cachée ; et même s'il obéissait, le mandat signé refuse avant toute signature.
- **Source** : `video-script.md`, plan 5.

### 7. Settlement, 2:40 à 3:15 (M)

- **À l'écran** : « 140 units, 14,700 cash gross » qui devient « 60 units, 6,300 cash net ». Puis « −57 % cash moved ». Puis la capture `07-lot-settled.png` et l'événement `LotSettled`.
- **Visuel** : les deux formes du symbole se referment au moment du règlement.
- **À dire** : chaque participant approuve sur la Flex ce qu'il reçoit et ce qu'il paie, avec le hash du lot. Une seule transaction. Le mode instantané utilise le même contrat.
- **Sources** : `guide-oral.md`, question 6 et section 5. Le chiffre de 57 % se recalcule : 6 300 / 14 700 = 43 % du cash brut, donc 57 % de cash en moins.

### 8. Ledger, inside the product, 3:15 à 3:45 (M)

- **À l'écran** : trois cartes. « Device Management Kit: every human signature is readable text (EIP-191) » / « Key Ring: the agent's API key is encrypted with a key derived from the Ledger seed » / « Clear Signing: tested, needs ERC-7730 for our own types; that is our next step ».
- **À dire** : on a testé le Clear Signing sur la Flex, on a choisi le texte lisible pour ne jamais demander de blind signing.
- **Source** : `DECISIONS.md` D6, README.

### 9. Who it is for, 3:45 à 4:20 (L)

- **À l'écran** : « Built for fund depositaries and administrators that run tokenized share classes. » Puis : « Software licence · integration · fixed fee per settled instruction. No share of the cash saved. »
- **En petit** : « Example of the segment: CACEIS ran the infrastructure of Amundi's tokenized money market share class (2025). No relationship. »
- **À dire** : pas un dépositaire central en premier client. Pas de part sur les économies du netting, pour ne pas entrer en conflit avec notre client.
- **Source** : README, Who it is for et Business model.

### 10. Proof and limits, 4:20 à 4:45 (M)

- **À l'écran**, colonne gauche : « 115 tests passing · 3 verified contracts on Base Sepolia · netted lot settled on chain ». Colonne droite, sobre : « The escrow trusts the engine key (on-chain verification ready on a branch) · test tokens, prefunded · mock NAV file ».
- **À dire** : ce qui marche, et ce qu'on assume. Les limites viennent de nous.
- **Sources** : `npm test` du 13 octobre (29 + 46 + 4 + 36), README, Limits we accept.

### 11. Close, 4:45 à 5:00 (L)

- **À l'écran** : « Signed by people. Settled by code. » Puis « Cendro · settlement engine for tokenized funds », l'URL du dépôt et un QR code.
- **À dire** : « Cendro. Signed by people, settled by code. Thank you. »

## Annexes, pour les questions

Affichées seulement si une question les appelle. Accessibles par un raccourci (touches 1 à 7 après la slide de fin).

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
