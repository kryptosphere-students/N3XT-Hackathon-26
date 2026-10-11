# Frontière agent / humain

Le brief demande de **nommer explicitement** ce que l'agent fait de façon autonome et ce qu'un humain approuve. Chaque projet doit contenir cette frontière dans son README et son pitch.

## Format attendu

Un tableau dans le README :

| Action | Exécutée par | Approuvée par | Preuve côté Ledger |
|---|---|---|---|
| Lire le solde | Agent | — | Aucune |
| Proposer un paiement | Agent (`agent-intent send`) | Humain, sur le device | Signature de l'intention |
| Déchiffrer un secret | Agent (`ring decrypt`) | — (réseau requis) | Clé dérivée du ring |
| Signer une transaction | DMK signer, déclenché par l'app | Humain, sur le device | Signature matérielle |

## Règles

- Toute action irréversible (transfert, publication, suppression, signature) doit figurer dans la colonne « Approuvée par » avec un humain ou un device.
- Si une action est marquée « Agent » seul, justifier pourquoi elle ne mérite pas de confirmation.
- Le jury demande la frontière : la présenter avec un schéma, pas seulement en texte.
