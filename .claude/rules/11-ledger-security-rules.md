# Règles de sécurité pour les projets Ledger

Consignes issues de la documentation Ledger (AI Tools, DMK, Key Ring, Agent Intent). Elles s'appliquent à tout code qui touche un signer, un secret ou une approbation humaine.

## Secrets

- **L'agent ne manipule jamais la valeur d'un mot de passe.** Il référence seulement un secret déjà provisionné, par exemple via `WALLET_PASS=$(security find-generic-password -a default -s ledger-wallet-cli -w)` sur macOS.
- Ne jamais écrire un mot de passe littéral dans une commande, un script ou un prompt. Cela vaut aussi pour les mots de passe de test.
- Ne jamais afficher un secret déchiffré dans le terminal, les logs ou la transcription. Rediriger vers un fichier (`-o`), un pipe ou une variable.
- `ring init --unsecure-no-password` ne sert pas à protéger des données réelles.

## Approbation humaine

- **L'écran du Ledger est le seul affichage de confiance.** Le navigateur, le terminal et le client peuvent être compromis.
- Toute opération à risque passe par le device. Ne jamais déduire un consentement du timing, de l'état de session ou d'un comportement passé.
- Ne jamais contourner une confirmation sur le device, ni dans le code ni dans l'UX.
- Une signature n'est jamais réutilisée. Un retry = nouveau flow depuis l'initialisation.
- Un agent ne peut pas démarrer seul une session authentifiée matérielle (Security Key). Le prévoir dans l'architecture.

## Signature

- Ne jamais mapper `eth_sign` sur `signMessage`. Utiliser `signMessage` (personal_sign, préfixé) ou `signTypedData` (EIP-712).
- Transaction Ethereum passée en `Uint8Array` RLP-encodé.
- Chemins de dérivation : **constantes littérales dans le code**, jamais saisies par l'utilisateur ni inférées par l'agent. Pas de préfixe `m/`.
- Adresse de réception : toujours `checkOnDevice: true`.

## Clear Signing

- Sans `originToken`, le signer fonctionne mais l'écran affiche du hex brut (blind signing), **sans erreur runtime**. Documenter l'état réel dans le projet et le pitch.
- `@ledgerhq/context-module` est requis pour le signer Ethereum, même en développement.

## Mode de test

- `setStub(true)`, les transports mock et Speculos ne servent qu'en test ou CI. Jamais en production : le modèle de sécurité est alors nul.

## Cycle de vie des clés

- Retirer un membre de Ledger Sync fait tourner la clé Key Ring. Rechiffrer les données existantes avant ce retrait, sinon elles deviennent illisibles.
- Une perte de mot de passe Key Ring est irrécupérable : il faut repartir de la même seed sur une nouvelle machine, relancer `ring init` et choisir un nouveau mot de passe.
