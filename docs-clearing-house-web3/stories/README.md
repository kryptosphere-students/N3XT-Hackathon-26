# Suivi agile : POC netting pré-financé (hackathon Ledger N3XT)

Source de vérité du backlog : ce dossier `stories/`. Pas de GitHub Issues en parallèle.

Objectif du POC : cycle complet de souscriptions et rachats de parts d'un fonds (3 participants), instructions signées sur Ledger, contrôle de NAV par un agent, netting et règlement DvP sur Base Sepolia, et une attaque refusée en direct. Spec de référence : `../spec-poc.md`.

## Horizon

48 h, ordre d'exécution uniquement. Aucune date dans ce backlog. Le « gel » se déclenche quand toutes les stories `must` sont `done` ou explicitement coupées (voir plus bas).

## Périmètre MoSCoW

| Priorité | Contenu |
|---|---|
| **Must** | Gouvernance, validation Ledger, contrats, netting, signatures, agents, tableau de bord, démo, soumission |
| **Should** | wallet-cli / Ring CLI (repli possible), Key Ring pour la config, vue statut de règlement |
| **Could** | Rien ajouté au périmètre actuel |
| **Won't** | Agent Intent (roadmap P2), ERC-3643, multi-fonds, NAV réelle, mainnet, fonds de défaut, novation, intégration CSD réelle, ISO 20022, réseau de règlement de production, volet réglementaire |

## Ordre d'exécution

1. **Débloquer** : `S-043` (monorepo), puis `S-001` à `S-007` (gouvernance, Flex, Clear Signing). Le test Clear Signing décide du format des instructions.
2. **En parallèle** : contrats (`S-009` à `S-014`, `S-042`) et netting et NAV (`S-015` à `S-018`, `S-041`).
3. **Signatures** : `S-019` à `S-022`, puis approbations et règlement `S-021`.
4. **Agents** : `S-024` à `S-029`, et `S-044` (prise d'ordres par email).
5. **Interface** : `S-030` à `S-034`.
6. **Démo et soumission** : `S-035` à `S-040`.

## Chemin critique

`S-005` et `S-006` sont faits (11 oct, EIP-191 retenu). Reste : `S-020` (signature des instructions) puis `S-021` (approbation du lot et règlement). En parallèle, `S-011` (escrow) doit être prêt avant `S-021`.

## Workflow

Kanban : `backlog → ready → in-progress → review → done`.

- Limite de travail en cours : 2 stories `in-progress` par personne.
- `review` : tests verts, lint sans warning, vérifié sur le Flex ou sur Base Sepolia si la story le demande.
- `done` : mergé, adresse ou preuve consignée (capture, lien explorateur, commande).

## Definition of Done

- Tests : unitaires et, pour la logique métier, tests de propriétés (Foundry pour les contrats, bigint pour le netting).
- Lint zéro warning.
- Fonction démontrée sur le matériel réel quand la story touche le Ledger.
- Aucun secret dans le dépôt.
- Friction Ledger consignée dans `../DX_FEEDBACK.md` quand elle existe.

## Coupes si retard

Ordre de coupe, du premier au dernier :

1. `S-033` vue statut de règlement (remplacée par un lien texte).
2. `S-023` Key Ring (repli : `.env` local, documenté comme non final).
3. `S-008` wallet-cli (repli : Key Ring coupé, noté dans les limites).
4. `S-029` plafond LLM réduit au minimum, si le budget est déjà borné au niveau de la console.

Déjà réduit le 11 oct (D8) : un seul événement `LotSettled` au lieu d'une racine de Merkle et d'un événement NAV séparé, stockage en fichiers JSON.

Ne jamais couper : `S-044` (c'est ce qui met l'IA au centre), `S-022` (refus des signatures invalides), `S-028` (la scène d'attaque), `S-036` (vidéo de secours), `S-039` (soumission).

## Hypothèses à confirmer

- Équipe de 2 personnes, à confirmer (`../QUESTIONS.md`, Q-15). Le découpage ci-dessus suppose deux flux parallèles.
- Code dans `clearing-house-web3/` à côté de ce dossier (D5 dans `DECISIONS.md`). Guide développeur : `../dev/README.md`.

## Index

- Tableau de suivi : [board.md](board.md)
- Questions ouvertes : [../QUESTIONS.md](../QUESTIONS.md)
- Plan de présentation : [../presentation/plan-presentation.html](../presentation/plan-presentation.html)
- Epics : `E-001` à `E-008`, voir [board.md](board.md)
