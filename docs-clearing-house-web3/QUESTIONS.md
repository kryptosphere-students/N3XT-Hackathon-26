# Questions ouvertes

Dernière mise à jour : 11 octobre 2026, horizon 48 h. Chaque question porte un statut : **ouvert** ou **partiel**. Les questions résolues sont listées en bas, avec leur réponse, pour garder les renvois des stories valides.

## Synthèse

| ID | Question | Statut | Qui décide |
|---|---|---|---|
| Q-01 | Fournisseur LLM et plafond de dépense | ouvert | Équipe |
| Q-02 | Accès Ledger et `originToken` | partiel | Équipe, auprès de Ledger |
| Q-03 | Clear Signing EIP-712 sur Flex | ouvert | Test S-006 |
| Q-04 | Soumission : POC seul | ouvert | Équipe |
| Q-05 | Code pré-existant au 7 octobre | ouvert | Équipe |
| Q-06 | Un Flex ou deux | partiel | Équipe |
| Q-07 | Qui soumet et qui approuve le règlement DvP | partiel | Équipe |
| Q-11 | Conditions d'utilisation de wallet-cli | partiel | Équipe |
| Q-13 | Repo public et accès du jury | ouvert | Équipe |
| Q-14 | Emplacement du code | ouvert | Équipe |
| Q-15 | Taille de l'équipe | ouvert | Équipe |
| Q-17 | Délai actuel de règlement et qui le fixe | ouvert | Équipe, avec deux interlocuteurs |
| Q-18 | Qualification de BP2S et SGSS | ouvert | Équipe |

---

## Q-01 — LLM : fournisseur et plafond de dépense

**Statut : ouvert.** Aucune clé n'est configurée : `ANTHROPIC_API_KEY` est absent et le CLI `ant` n'est pas installé sur cette machine.

Tarifs vérifiés sur la page officielle Anthropic le 11 octobre 2026 :

| Modèle | Entrée $/MTok | Sortie $/MTok | Lecture de cache $/MTok |
|---|---|---|---|
| `claude-opus-5-5` | 4 | 20 | 0,20 |
| `claude-sonnet-5-5` | 2 | 10 | 0,10 |
| `claude-haiku-5-5` | 0,10 | 0,50 | 0,01 |

Source : https://platform.claude.com/docs/en/about-claude/pricing.md

**Recommandation** : `claude-opus-5-5`, environ 0,02 $ par appel (4 000 tokens en entrée dont 2 500 en cache, 700 en sortie). Plafond de 50 $, alerte à 25 $, à poser dans la Console Anthropic. `claude-haiku-5-5` est environ 25 fois moins cher, au choix de l'équipe si la qualité suffit.

**Action** : créer la clé, poser le plafond, la stocker dans `.env` (S-004, S-029).

---

## Q-02 — Accès Ledger et `originToken`

**Statut : partiel.** Aucun accès Ledger spécifique dans le dépôt ni dans le brief. Disponible : docs publiques, dépôts publics `LedgerHQ/agent-skills` et `LedgerHQ/device-sdk-ts`, Discord avec des mentors en semaine.

Le Clear Signing du signer ETH passe par un `originToken` du programme partenaire Ledger. Les sources divergent sur l'effet de son absence : hex brut à l'écran selon la skill DMK, Transaction Checks indisponibles selon la page du signer. Le test S-006 tranche.

**Action** : demander sur Discord si un `originToken` est accessible pour un POC hackathon.

---

## Q-03 — Clear Signing EIP-712 sur Flex

**Statut : ouvert.** Dépend du test S-006, première tâche du backlog. Repli prévu : instructions signées en EIP-191 texte, lisible sur le Flex, noté dans les limites du pitch et dans `DX_FEEDBACK.md`.

---

## Q-04 — Soumission : POC seul

**Statut : ouvert, décision de l'équipe.** Le brief prévoit une seule soumission par équipe. Le POC doit donc être le projet soumis. Le copilote BTC ne peut être cité que comme contexte, et déclaré s'il est pré-existant (Q-05).

**Recommandation** : POC seul. Consigner la décision dans `DECISIONS.md` (S-002).

---

## Q-05 — Code pré-existant au 7 octobre

**Statut : ouvert.** Le brief dit qu'un code pré-existant non déclaré entraîne une disqualification. Le POC est né le 10 octobre, après le kickoff : c'est accepté, tant que tout code pré-existant est déclaré. Le copilote BTC n'a pas encore été daté.

**Action** : dater le premier commit du copilote BTC et le déclarer dans `DISCLOSURE.md` s'il est antérieur au 7 octobre (S-001).

---

## Q-06 — Un Flex ou deux

**Statut : partiel.** Recommandation retenue dans la spec : un seul Flex, trois comptes dérivés (`44'/60'/n'/0/0`, S-007). Le DMK escalade s'il détecte plusieurs appareils. À valider par l'équipe.

---

## Q-07 — Qui soumet et qui approuve le règlement DvP

**Statut : partiel.** La spec et le diagramme suivent maintenant la recommandation : l'agent prépare le lot et les transactions, un humain approuve chaque règlement sur son Flex. Le wallet de gaz de l'agent ne publie que l'empreinte de NAV. À valider par l'équipe.

---

## Q-11 — Conditions d'utilisation de wallet-cli

**Statut : partiel.** DMK est sous Apache-2.0 : utilisation et démo publique permises, avec la mention de licence. `LedgerHQ/agent-skills` n'a pas de licence déclarée : on le cite, on ne le redistribue pas. Les conditions de wallet-cli n'ont pas été lues (lien « Ledger Wallet Terms of Use » dans la doc CLI).

**Action** : les lire avant la vidéo publique.

---

## Q-13 — Repo public et accès du jury

**Statut : ouvert.** Le brief demande un lien de dépôt GitHub accessible au jury. Trancher : dépôt public, ou accès donné explicitement au jury.

---

## Q-14 — Emplacement du code

**Statut : ouvert.** Recommandation : code dans `clearing-house-web3/`, à côté de ce dossier de documentation.

---

## Q-15 — Taille de l'équipe

**Statut : ouvert.** Le backlog suppose deux personnes en parallèle. Avec une seule personne, couper les stories `should` dès le départ (`stories/README.md`, « Coupes si retard »).

---

## Q-17 — Délai actuel de règlement et qui le fixe

**Statut : ouvert.** Le gain de vitesse ne se mesure que par rapport à un délai de référence, non documenté à ce jour.

**Points à établir** : délai actuel entre ordre et règlement pour un fonds donné ; part due à la NAV, aux heures limites et aux opérations manuelles ; part due au règlement lui-même.

**Action** : obtenir ce délai auprès de deux interlocuteurs du post-marché. Il sert de base à la mesure de S-042.

---

## Q-18 — Qualification de BP2S et SGSS

**Statut : ouvert.** La cible est fixée : dépositaires et administrateurs de fonds, CACEIS comme référence vérifiée, dépositaires centraux en cible secondaire (`cadrage.md`, Clients visés). Aucune initiative de BP2S ni de SGSS sur les fonds tokenisés n'a été vérifiée.

**Action** : vérifier leurs annonces publiques sur les fonds tokenisés avant de les citer dans le pitch, et identifier un interlocuteur post-marché chez l'un d'eux.

---

## Questions réglées

| ID | Question | Réponse |
|---|---|---|
| Q-08 | Rôle de wallet-cli | Key Ring seulement. wallet-cli ne gère pas les transactions sur testnet, elles passent par le DMK. `ring init` passe par l'app Ledger Sync (S-008). Source : `LedgerHQ/agent-skills`, `wallet-cli-usage`. |
| Q-09 | Agent Intent dans le POC | Hors POC, en roadmap. Son envoi ne gère que l'Ethereum mainnet. |
| Q-10 | Faucet Base Sepolia | Faucet Alchemy : 0,1 ETH par 24 h et par adresse, solde minimal de 0,001 ETH sur Ethereum mainnet. Blast API à éviter. Conditions à revérifier sur https://www.alchemy.com/faucets/base-sepolia au moment du besoin. |
| Q-12 | Chiffres 100 M€ et 10 M€ | Présentés comme illustratifs dans la spec, la présentation et le tableau de bord (S-032). |
| Q-16 | Règles sur les nouveaux projets | Un projet né après le kickoff est accepté. Seule contrainte : déclarer le code pré-existant (Q-05). |
| — | Cible client | Dépositaires et administrateurs de fonds, CACEIS comme référence. Dépositaires centraux en cible secondaire. Reste la qualification de BP2S et SGSS (Q-18). |
