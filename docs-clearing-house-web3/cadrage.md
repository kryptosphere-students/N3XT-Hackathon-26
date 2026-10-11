# Cadrage : clearing house web3 pour parts de fonds

Date : 10 octobre 2026, mis à jour le 11 octobre 2026. Statut : POC, hypothèses de travail non validées.

## Hypothèses retenues

1. **Forme commerciale : éditeur de logiciel.** Une entreprise vend une licence et un support aux dépositaires et administrateurs de fonds (banques dépositaires, agents de transfert), qui déploient et exploitent la plateforme. Les dépositaires centraux (CSD) sont une cible secondaire (voir Clients visés).
2. **Périmètre : moteur de règlement DvP à deux modes, sans CCP.** Mode instantané : chaque ordre est réglé dès son exécution, les fonds et parts de l'ordre étant mis en séquestre. Mode netting : les ordres d'un cycle sont compensés, et chaque participant apporte la couverture de son solde net. Pas de fonds de défaut mutualisé, pas de novation.
3. **Ledger fournit la couche signature et la protection des secrets.** La stack (DMK, Clear Signing, Key Ring) signe les instructions et protège les clés. Elle ne calcule aucune NAV.

Le volet réglementaire (statut de l'opérateur, externalisation, régime des tokens, responsabilité) est mis en pause pour le POC.

## Règles à respecter

- **Pas de code pré-hackathon** dans le dépôt N3XT. Ce projet doit être construit à partir de zéro, et DISCLOSURE.md doit le mentionner si une partie est utilisée pendant l'événement.
- **Modèle copilote** : l'IA planifie, explique et prépare. Le code déterministe fait les calculs (NAV, netting, couverture) et construit les transactions. Aucun chiffre ni transaction n'est produit par le LLM.
- **Validation Ledger** : chaque action qui ajoute du risque est signée sur le Ledger, avec Clear Signing quand le schéma est couvert. Les règles de mandat sont signées et le code ignore toute règle non signée.
- **Périmètre** : toute bascule depuis le projet BTC copilot doit être décidée par l'équipe et consignée dans DECISIONS.md.

## Modèle de règlement transposé aux parts de fonds

Pour les souscriptions et rachats de parts de fonds, les flux sont calculés à la valeur liquidative (NAV), avec règlement différé (souvent J+2 ou J+3).

Le moteur propose deux modes :

- **Instantané** : un ordre isolé est réglé en DvP atomique dès son exécution, comme un lot de taille 1.
- **Netting** : le moteur calcule les positions nettes par fonds et par participant, vérifie la couverture, puis règle les soldes nets en DvP atomique.

Dans les deux modes, la piste d'audit est ancrée on-chain par une racine de Merkle du lot, et l'empreinte des entrées et du résultat de la NAV est publiée.

Cycle type : les participants (gérants, dépositaires, agents de cash) soumettent des instructions signées. Le moteur vérifie le mandat, compense si le mode netting est choisi, puis règle.

## Architecture

| Couche | Rôle | Qui décide |
|---|---|---|
| Parts tokenisées | Parts de fonds sous forme de tokens à transfert restreint (ex. ERC-3643, simplifié pour le POC) | Règles de conformité du fonds |
| Instructions | Souscription ou rachat en EIP-712, affichées en clair sur le Ledger | Le gérant, sur son Ledger |
| NAV | Valeur fournie par l'administrateur, recalculée par du code déterministe. Entrées et résultat hachés et publiés | Administrateur, puis code audité |
| Moteur de règlement | Code déterministe, sans LLM : mode instantané ou netting, couverture, racine de Merkle | Code audité |
| Agents | Contrôle des instructions, rapprochement NAV, surveillance des coupures, explications, propositions correctives | Aucune signature, dans le mandat signé uniquement |
| Règlement | DvP atomique sur réseau permissionné ou L2, cash en monnaie tokenisée ou stablecoin réglementé | Smart contract, après approbation sur Ledger |
| Secrets | Configuration et clés des agents chiffrées | Key Ring |

Point à vérifier : quels schémas EIP-712 Clear Signing couvre réellement pour les souscriptions et rachats. Le test minimal sur Flex est la première tâche du backlog (S-006), avec repli sur une signature en texte EIP-191 si le rendu n'est pas lisible.

## Proposition de valeur

Le service n'apporte aucun fonds. Il apporte un moteur de règlement plus rapide et plus vérifiable, sans perte de sécurité.

**Gains technologiques (à mesurer sur un scénario de référence)**

- *Délai* : règlement DvP atomique dès l'exécution en mode instantané, ou cycle netté en mode netting. Le délai dépend aussi de la publication de la NAV et des heures limites, que le service ne maîtrise pas.
- *Sécurité* : chaque ordre est signé sur le boîtier Ledger, les règles de mandat sont appliquées par le code, et une attaque injectée est refusée.
- *Vérifiabilité* : le calcul de NAV et de netting est déterministe, ses entrées et son résultat sont hachés et publiés. Le contrat ancre la racine de Merkle du lot.

**Gain monétaire (à présenter comme conséquence, pas comme argument principal)**

- Le netting réduit le cash que chaque participant doit mettre de côté. C'est un gain pour les participants, mesurable seulement avec des volumes réels.

**Contrainte, pas bénéfice**

- La couverture du solde net est nécessaire au netting sans CCP. Ce sont les participants qui l'apportent, pas le service.

**Limites**

- Le code garantit l'arithmétique et la traçabilité, pas l'exactitude des prix d'entrée. Les prix viennent d'un oracle ou de l'administrateur.
- Un smart contract peut contenir des bugs et une mise à jour administrateur reste un point central. Le gain sécurité dépend d'un audit et d'une gouvernance des mises à jour.
- La NAV reste un acte légal de l'administrateur, validé par le dépositaire. La NAV on-chain est hors POC.

## Clients visés

| Cible | Statut | Argument |
|---|---|---|
| **CACEIS** (dépositaire et administrateur de fonds) | Référence vérifiée : infrastructure de la part tokenisée d'un fonds monétaire Amundi (novembre 2025), dépositaire des fonds tokenisés Spiko (2024) | Ajouter un moteur de règlement vérifiable à une offre tokenisée existante. CACEIS peut aussi construire ce moteur lui-même : cible et concurrent potentiel. |
| **BP2S** (BNP Paribas Securities Services) | À qualifier : aucune initiative vérifiée sur les fonds tokenisés (Q-18) | Réduire le délai de règlement et la charge de réconciliation. |
| **SGSS** (Société Générale Securities Services) | À qualifier : aucune initiative vérifiée (Q-18) | Même argument, à valider. |
| Agents de transfert, administrateurs indépendants, gérants de fonds tokenisés | À qualifier | Règlement plus rapide et piste d'audit vérifiable. |
| Dépositaires centraux (Euroclear, Clearstream) | Cible secondaire | Ils règlent déjà en DvP via T2S, et leurs cycles d'achat sont très longs. Le service doit prouver un gain précis avant de les viser. |

Entrée recommandée : un acteur déjà engagé sur les fonds tokenisés, en pilote. Aucune relation n'est établie avec ces entreprises.

## Modèle de licence

Le client (dépositaire ou administrateur de fonds) achète une licence annuelle et un support. Le contenu inclus :

- le moteur de règlement à deux modes (instantané et netting) et la vérification de couverture ;
- les contrats de règlement DvP et le modèle de parts tokenisées ;
- la couche de signature Ledger (orchestration, vérification, affichage Clear Signing) ;
- les modules agents (contrôle des instructions, rapprochement NAV, alertes) ;
- les connecteurs standard (NAV, formats de messages, export d'audit) ;
- la console d'exploitation et les journaux d'audit, avec ancrage on-chain ;
- les mises à jour, le support et un SLA.

Hors licence, facturé à part : l'hébergement si le client ne le gère pas, les intégrations spécifiques, la formation, les matériels Ledger. Les licences tierces doivent être vérifiées : DMK est sous Apache-2.0, les conditions de wallet-cli restent à lire (Q-11).

Le client pourrait aussi acheter un service opéré plus tard, s'il n'a pas d'équipe interne.

## Revenus

- Licence annuelle par client, avec plafond par nombre de participants.
- Frais d'intégration et de déploiement.
- Support et maintenance, avec SLA.
- Frais par instruction traitée, à négocier avec le client ou répercutés aux participants.
- Services de supervision optionnels : rapports d'audit, surveillance continue.

Facturer une part de la valeur du netting créerait un conflit d'intérêts avec le client, qui facture lui-même les participants. Option à privilégier : un prix fixe par instruction ou par participant.

Exemple illustratif (hypothèses à valider) : un cycle compensant 100 M€ de flux bruts en 10 M€ nets réduit de 90 % la couverture à apporter par les participants. C'est un gain pour eux, pas une recette du service.

## Hypothèses économiques à valider

Ces points ne sont pas chiffrés. Ils doivent être validés avant de construire un modèle financier.

- **Délai de référence** : délai actuel entre ordre et règlement, et part due à la NAV, aux heures limites et au règlement (Q-17). C'est la base de l'argument principal.
- **Volumes** : nombre de souscriptions et rachats par jour, par fonds et par participant, et taux de compensation réel. L'hypothèse de 90 % de l'exemple dépend fortement de la corrélation entre flux.
- **Couverture immobilisée** : montant que chaque participant doit apporter, et effet du netting sur ce montant. Gain pour les participants, à mesurer, pas l'argument principal.
- **Prix de licence** : niveau acceptable pour un dépositaire ou un administrateur, et plafond par participant.
- **Frais par instruction** : montant par instruction, et qui le paie (client ou participants).
- **Coût d'intégration** : durée et charge de déploiement chez un client, en jours-hommes, car ce coût est le principal risque de marge.
- **Coûts récurrents** : hébergement, support, maintenance, équipe d'astreinte et audits de sécurité.
- **Cycle de vente** : durée entre premier contact et contrat, et probabilité de conversion.
- **Coûts Ledger** : conditions commerciales de la stack.
- **Seuil de rentabilité** : nombre de clients ou de participants nécessaires pour couvrir les coûts fixes.

## Concurrents

Vérifiés par recherche web (10 et 11 octobre 2026) :

- **SIX Digital Exchange (Suisse)** : bourse et dépositaire central sur DLT, autorisé par le régulateur suisse. Concurrent sur l'infrastructure complète, pas sur un module.
- **Broadridge Distributed Ledger Repo** : plateforme de repo sur DLT. Concurrent sur le règlement de financements, pas sur les parts de fonds.
- **Securitize** : émission de produits tokenisés. Concurrent sur l'émission, pas sur le règlement.
- **CACEIS** : infrastructure de souscriptions et rachats de parts tokenisées (Amundi, Spiko). Cible prioritaire et concurrent potentiel.
- **Ledger Enterprise** : offre entreprise de Ledger. Pertinent comme partenaire ou comme référence pour les usages institutionnels.

Non vérifiés, à confirmer avant tout usage : Euroclear et Clearstream (initiatives DLT internes), BP2S et SGSS, administrateurs de fonds (State Street, BNY), plateformes de distribution (Allfunds, Calastone), garde et MPC (Fireblocks, Anchorage, Taurus).

Le créneau à défendre : un moteur de règlement de parts de fonds à deux modes, avec signature Ledger et agents, vendu en licence aux dépositaires et administrateurs de fonds. Aucun des acteurs vérifiés ne semble le proposer précisément.

## Cycle de vente et sponsor

Le cycle d'une banque dépositaire est long : plusieurs mois entre le premier contact et le contrat, avec comité, appel d'offres et audit de sécurité. Le sponsor naturel est le responsable post-marché, des opérations ou de l'innovation. À valider avec des interlocuteurs réels.

## Agents

Les agents peuvent contrôler les instructions, rapprocher les positions avec la NAV reçue de l'administrateur, surveiller les coupures, expliquer les écarts et proposer des corrections. Ils ne signent rien, ne dépassent jamais le mandat signé, et ne calculent aucune NAV ni aucun montant de manière autonome.

## Questions ouvertes (après le POC)

Les questions du POC sont suivies dans `QUESTIONS.md`. Celles-ci concernent le produit au-delà du hackathon.

**Produit et technique**

- Réseau de règlement : permissionné, L2, ou infrastructure du client ? Contraintes de confidentialité entre participants ?
- NAV : intégration réelle avec l'administrateur, et NAV on-chain avec oracle.
- Intégration avec le client : API, messagerie, ISO 20022.

**Ledger**

- Chemin institutionnel via Ledger Enterprise ou via une garde.

**Modèle d'affaires**

- Le client veut-il une licence seule, ou aussi un service opéré ?

**Sécurité et exploitation**

- Quelles clés contrôle le client, lesquelles relèvent de l'éditeur ?
- Plan de continuité et de reprise. Qui peut suspendre un cycle en cas d'incident ?

## Prochaines étapes

1. Tester Clear Signing sur Flex avec un message EIP-712 minimal (S-006).
2. Construire le POC selon le backlog (`stories/`).
3. Mesurer le délai instruction → règlement dans les deux modes (S-042).
4. Obtenir le délai de référence auprès de deux interlocuteurs du post-marché (Q-17), et qualifier BP2S et SGSS (Q-18).
5. Chiffrer les hypothèses économiques à partir des volumes réels ou simulés.
