# Tableau de suivi

Vue condensée des 8 epics et des 44 stories. Détail dans chaque fichier.

## Epics

| Epic | Titre | Stories | Priorité | Statut |
|---|---|---|---|---|
| [E-001](E-001-gouvernance-conformite.md) | Gouvernance et conformité | S-001 à S-004, S-043 | Must | in-progress |
| [E-002](E-002-validation-ledger.md) | Validation Ledger en amont | S-005 à S-008 | Must | in-progress |
| [E-003](E-003-contrats-testnet.md) | Contrats sur testnet | S-009 à S-014, S-042 | Must | in-progress |
| [E-004](E-004-moteur-netting.md) | Moteur de netting et NAV | S-015 à S-018, S-041 | Must | done |
| [E-005](E-005-signatures-ledger.md) | Signatures Ledger et garde-fous | S-019 à S-023 | Must | in-progress |
| [E-006](E-006-agents-nav-llm.md) | Agents, NAV et LLM | S-024 à S-029, S-044 | Must | in-progress |
| [E-007](E-007-tableau-de-bord.md) | Tableau de bord | S-030 à S-034 | Must | in-progress |
| [E-008](E-008-demo-soumission.md) | Démo, soumission et pitch | S-035 à S-040 | Must | in-progress |

## Répartition (D12)

| Qui | Stories |
|---|---|
| Mark | Contrats (S-009 à S-014, S-042), signatures (S-007, S-019 à S-022), plomberie de l'agent (S-029, S-027, S-044), interface (S-030 à S-034) |
| Louis | Moteur (S-015 à S-018), S-026 checkInstruction, contenu de l'agent (prompt système, trois emails de démo), S-024 et S-041 |
| Coupées | S-025 (vérification de la NAV par le code), S-033 (lien vers l'explorateur) |
| Bonus | S-023 Key Ring, seulement s'il reste du temps |

## Stories

| ID | Story | Epic | Priorité | Taille | Statut | Dépend de |
|---|---|---|---|---|---|---|
| S-001 | DISCLOSURE.md | E-001 | must | XS | done | — |
| S-002 | DECISIONS.md, décision de périmètre | E-001 | must | XS | done | Q-04 |
| S-003 | DX_FEEDBACK.md | E-001 | must | XS | done | — |
| S-004 | Hygiène des secrets | E-001 | must | S | ready | — |
| S-043 | Initialiser le monorepo | E-001 | must | S | done | — |
| S-005 | Connexion WebHID au Flex | E-002 | must | S | done | — |
| S-006 | Test Clear Signing EIP-712 sur Flex (EIP-191 retenu) | E-002 | must | S | done | S-005 |
| S-007 | Trois comptes dérivés sur le Flex | E-002 | must | XS | done | S-005 |
| S-008 | wallet-cli et ring init | E-002 | should | M | backlog | S-005, Q-08 |
| S-009 | Token de parts à liste blanche | E-003 | must | M | done | — |
| S-010 | Mock cash | E-003 | must | XS | done | — |
| S-011 | Escrow DvP avec préfinancement | E-003 | must | L | done | S-009, S-010 |
| S-012 | Événement LotSettled (hash du lot, hash NAV, signatures) | E-003 | must | S | done | S-011 |
| S-013 | Tests Foundry unitaires et de propriétés | E-003 | must | M | done | S-009 à S-012 |
| S-014 | Déploiement Base Sepolia et vérification | E-003 | must | S | done | S-013 |
| S-042 | Mode instantané et mode netting dans le même moteur | E-003 | must | M | done | S-011, S-016 |
| S-015 | Soldes nets en bigint | E-004 | must | M | done | — |
| S-016 | Vérification de couverture | E-004 | must | S | done | S-015 |
| S-017 | Hash du lot côté TypeScript | E-004 | must | S | done | S-012, S-015 |
| S-018 | Tests de propriétés du netting | E-004 | must | S | done | S-015 à S-017 |
| S-041 | Publication du hash des entrées et du résultat de NAV | E-004 | must | S | done | S-024 |
| S-019 | Signature EIP-191 des règles de mandat | E-005 | must | M | done | S-005 |
| S-020 | Signature EIP-191 des instructions | E-005 | must | M | done | S-006 |
| S-021 | Approbation du lot en EIP-191, règlement envoyé par le moteur | E-005 | must | L | done | S-007, S-011, S-014, S-020 |
| S-022 | Refus des instructions et règles non signées | E-005 | must | S | done | S-019, S-020 |
| S-023 | Configuration et clés agents dans Key Ring | E-005 | bonus | M | done | S-008 |
| S-024 | Mock serveur NAV | E-006 | must | S | done | — |
| S-025 | Agent de rapprochement NAV | E-006 | cut | M | cut | S-024 |
| S-026 | Contrôle des instructions contre le mandat | E-006 | must | M | done | S-020, S-044 |
| S-027 | Outils LLM en liste blanche | E-006 | must | M | done | S-029 |
| S-028 | Scénario d'injection bloqué (email piégé) | E-006 | must | S | done | S-027, S-044 |
| S-029 | Clé LLM de test et plafond de dépense | E-006 | must | XS | done | Q-01 |
| S-044 | Agent de prise d'ordres (email vers brouillon) | E-006 | must | M | done | S-027, S-029 |
| S-030 | Squelette Vite, React et viem | E-007 | must | XS | done | — |
| S-031 | Vue instructions et statut de signature | E-007 | must | M | done | S-020, S-030 |
| S-032 | Vue gross contre net | E-007 | must | S | done | S-015, S-030 |
| S-033 | Vue statut de règlement et liens explorateur | E-007 | cut | S | cut | S-021 |
| S-034 | Bouton scénario d'attaque | E-007 | must | XS | done | S-028, S-031 |
| S-035 | Script de démo de 3 minutes | E-008 | must | XS | done | S-021, S-028, S-034 |
| S-036 | Vidéo de secours | E-008 | must | S | backlog | S-035 |
| S-037 | README : frontière, adresses, limites | E-008 | must | S | done | S-014, S-021 |
| S-038 | Plan de présentation HTML | E-008 | must | S | in-progress | — |
| S-039 | Soumission : formulaire, dépôt, post | E-008 | must | XS | backlog | S-036, S-037 |
| S-040 | Deux répétitions du pitch | E-008 | must | S | backlog | S-035, S-038 |

## Compteurs

- Priorité : 40 `must`, 1 `should` (S-008), 1 `bonus` (S-023), 2 `cut` (S-025, S-033). Total 44.
- Statut : 31 `done` (S-043, S-005, S-006, S-007, S-009, S-010, S-011, S-012, S-013, S-014, S-042, S-015, S-016, S-017, S-018, S-041, S-019, S-020, S-022, S-023, S-024, S-026, S-027, S-028, S-029, S-044, S-030, S-031, S-032, S-034, S-035), 1 `ready` (S-004), 6 `in-progress` (S-001, S-002, S-003, S-021, S-037, S-038), 2 `cut`, 4 `backlog`. Total 44.
