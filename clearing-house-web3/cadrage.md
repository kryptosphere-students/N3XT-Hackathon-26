# Cadrage : clearing house web3 pour parts de fonds

Date : 10 octobre 2026. Statut : POC, hypothèses de travail non validées.

## Hypothèses retenues

1. **Forme commerciale : éditeur de logiciel.** Une entreprise vend une licence et un support à plusieurs CSD, qui déploient et exploitent la plateforme.
2. **Périmètre : utilitaire de netting pré-financé, sans CCP.** Chaque participant préfinance son solde net. Pas de fonds de défaut mutualisé, pas de novation.
3. **Ledger fournit la couche signature et la protection des secrets.** La stack (DMK, Clear Signing, Key Ring, Agent Intent) signe les instructions et protège les clés. Elle ne calcule aucune NAV.

Le volet réglementaire (statut du CSD, externalisation, régime des tokens, responsabilité) est mis en pause pour le POC.

## Règles à respecter

- **Pas de code pré-hackathon** dans le dépôt N3XT. Ce projet doit être construit à partir de zéro, et DISCLOSURE.md doit le mentionner si une partie est utilisée pendant l'événement.
- **Modèle copilote** : l'IA planifie, explique et prépare. Le code déterministe fait les calculs (NAV, netting, couverture) et construit les transactions. Aucun chiffre ni transaction n'est produit par le LLM.
- **Validation Ledger** : chaque action qui ajoute du risque est signée sur le Ledger, avec Clear Signing quand le schéma est couvert. Les règles de mandat sont signées et le code ignore toute règle non signée.
- **Périmètre** : toute bascule depuis le projet BTC copilot doit être décidée par l'équipe et consignée dans DECISIONS.md.

## Modèle de clearing transposé aux parts de fonds

Pour les souscriptions et rachats de parts de fonds, les flux sont calculés à la valeur liquidative (NAV), avec règlement différé (souvent J+2 ou J+3).

Le système calcule les positions nettes par fonds et par participant, vérifie la couverture préfinancée, puis règle en DvP atomique. La piste d'audit est ancrée on-chain par une racine de Merkle du lot compensé.

Cycle type : les participants (gérants, dépositaires, agents de cash) soumettent des instructions signées. Le moteur de netting calcule, vérifie la couverture, puis règle.

## Architecture

| Couche | Rôle | Qui décide |
|---|---|---|
| Parts tokenisées | Parts de fonds sous forme de tokens à transfert restreint (ex. ERC-3643) | Règles de conformité du fonds |
| Instructions | Souscription ou rachat en EIP-712, affichées en clair sur le Ledger | Le gérant, sur son Ledger |
| NAV | Valeur fournie par l'administrateur du fonds, recalculée et contrôlée par du code déterministe | Administrateur, puis code audité |
| Moteur de netting | Code déterministe, sans LLM : netting, couverture, marge | Code audité |
| Agents | Contrôle des instructions, rapprochement NAV, surveillance des coupures, explications, propositions correctives | Aucune signature, dans le mandat signé uniquement |
| Règlement | DvP atomique sur réseau permissionné ou L2, cash en monnaie tokenisée ou stablecoin réglementé | Smart contract |
| Secrets | Configuration et clés des agents chiffrées | Key Ring |

Point à vérifier : quels schémas EIP-712 Clear Signing couvre réellement pour les souscriptions et rachats. Un test minimal sur Flex est prévu avant lundi, avec repli sur une signature en texte EIP-191 si le rendu n'est pas lisible.

## Modèle de licence

Le CSD achète une licence annuelle et un support. Le contenu inclus :

- le moteur de netting et de couverture préfinancée ;
- les contrats de règlement DvP et le modèle de parts tokenisées ;
- la couche de signature Ledger (orchestration, vérification, affichage Clear Signing) ;
- les modules agents (contrôle des instructions, rapprochement NAV, alertes) ;
- les connecteurs standard (NAV, formats de messages, export d'audit) ;
- la console d'exploitation et les journaux d'audit, avec ancrage on-chain ;
- les mises à jour, le support et un SLA.

Hors licence, facturé à part : l'hébergement si le client ne le gère pas, les intégrations spécifiques, la formation, les matériels Ledger. Les licences tierces (DMK, Key Ring) doivent être vérifiées, notamment leur redistribution.

Le CSD pourrait aussi acheter un service opéré plus tard, pour les clients sans équipes internes.

## Revenus

- Licence annuelle par CSD, avec plafond par nombre de participants.
- Frais d'intégration et de déploiement.
- Support et maintenance, avec SLA.
- Frais par instruction traitée, à négocier avec le CSD ou répercutés aux participants.
- Services de supervision optionnels : rapports d'audit, surveillance continue.

Le partage de la valeur du netting crée un conflit d'intérêts avec le CSD, qui facture les participants. Option à privilégier : un prix fixe par instruction ou par participant, plutôt qu'une part de la valeur économisée. Le partage peut aussi se faire avec les participants, via une réduction de frais.

Exemple illustratif (hypothèses à valider) : un cycle compensant 100 M€ de flux bruts en 10 M€ nets libère 90 % du préfinancement.

## Hypothèses économiques à valider

Ces points ne sont pas chiffrés. Ils doivent être validés avant de construire un modèle financier.

- **Volumes** : nombre de souscriptions et rachats par jour, par fonds et par participant, et taux de compensation réel (part des flux bruts qui disparaît au netting). L'hypothèse de 90 % de l'exemple est à confirmer, car elle dépend fortement de la corrélation entre flux.
- **Préfinancement** : montant de cash ou de parts que chaque participant doit immobiliser, et coût d'opportunité de cette immobilisation. C'est le chiffre qui motive le client.
- **Prix de licence** : niveau acceptable pour un CSD, et plafond par participant à fixer.
- **Frais par instruction** : montant par instruction, et qui le paie (CSD ou participants).
- **Coût d'intégration** : durée et charge de déploiement chez un CSD, en jours-hommes, car ce coût est le principal risque de marge.
- **Coûts récurrents** : hébergement, support, maintenance, équipe d'astreinte et audits de sécurité.
- **Cycle de vente** : durée entre premier contact et contrat, et probabilité de conversion.
- **Coûts Ledger** : conditions commerciales de la stack, et redistribution de DMK et Key Ring.
- **Seuil de rentabilité** : nombre de CSD ou de participants nécessaires pour couvrir les coûts fixes.

## Concurrents

Vérifiés par recherche web (10 octobre 2026) :

- **SIX Digital Exchange (Suisse)** : bourse et dépositaire central sur DLT, autorisé par le régulateur suisse. Concurrent sur l'infrastructure complète, pas sur un module.
- **Broadridge Distributed Ledger Repo** : plateforme de repo sur DLT à volumes importants en 2026. Concurrent sur le règlement de financements, pas sur les parts de fonds.
- **Securitize** : émission de produits tokenisés, avec des volumes on-chain significatifs. Concurrent sur l'émission, pas sur le netting. Le détail de ses services de transfer agent reste à confirmer.
- **Ledger Enterprise** : offre entreprise de Ledger, annoncée en 2026. Pertinent comme partenaire ou comme référence pour les usages institutionnels.

Non vérifiés, à confirmer avant tout usage : Euroclear et Clearstream (initiatives DLT internes), administrateurs de fonds (State Street, BNY), plateformes de distribution (Allfunds, Calastone), garde et MPC (Fireblocks, Anchorage, Taurus).

Le créneau à défendre : netting pré-financé de parts de fonds, avec signature Ledger et agents, vendu en licence à des CSD. Aucun des acteurs vérifiés ne semble le proposer précisément.

## Cycle de vente et sponsor

Le cycle d'un CSD est long : plusieurs mois entre le premier contact et le contrat, avec comité, appel d'offres et audit de sécurité. Le sponsor naturel est le responsable post-marché, l'opérations ou l'innovation. À valider avec des interlocuteurs réels.

## Agents

Les agents peuvent contrôler les instructions, rapprocher les positions avec la NAV reçue de l'administrateur, surveiller les coupures, expliquer les écarts et proposer des corrections. Ils ne signent rien, ne dépassent jamais le mandat signé, et ne calculent aucune NAV ni aucun montant de manière autonome.

## Questions ouvertes (POC)

**Produit et technique**

- Périmètre du POC : un fonds, trois participants, un cycle de netting, règlement DvP sur testnet.
- Réseau de règlement : permissionné, L2, ou infrastructure du CSD ? Contraintes de confidentialité entre participants ?
- NAV : mock de l'administrateur pour le POC, puis intégration réelle.
- Capacités Clear Signing pour EIP-712 (test à faire sur Flex).
- Intégration avec un CSD : API, messagerie, ISO 20022.

**Ledger**

- Conditions d'utilisation de la stack en produit commercial, et possibilité de redistribution de DMK et Key Ring.
- Chemin institutionnel via Ledger Enterprise ou via une garde.

**Modèle d'affaires**

- Le CSD veut-il une licence seule, ou aussi un service opéré ?
- Choix du mode de rémunération lié au netting (prix fixe recommandé).

**Sécurité et exploitation**

- Quelles clés contrôle le CSD, lesquelles relèvent de l'éditeur ?
- Plan de continuité et de reprise. Qui peut suspendre un cycle en cas d'incident ?

## Prochaines étapes

1. Valider le POC (périmètre, un fonds, trois participants) avec l'équipe.
2. Tester Clear Signing sur Flex avec un message EIP-712 minimal.
3. Construire le prototype sur testnet.
4. Chiffrer les hypothèses économiques à partir des volumes réels ou simulés.
5. Identifier deux interlocuteurs CSD ou acteurs de la place pour valider le besoin.
