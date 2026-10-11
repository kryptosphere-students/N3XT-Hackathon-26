---
name: ledger-key-ring
description: Chiffrer et déchiffrer des secrets avec Ledger Key Ring (wallet-cli ring) — provisioning une fois sur device, usage headless ensuite. À charger pour un agent qui doit utiliser des secrets sans jamais les exposer, un usage CI/cloud sans USB, ou une question sur la gestion de mots de passe du ring.
---

# Ledger Key Ring

Chiffrement de fichiers et de texte avec des clés dérivées de la seed Ledger. Le device sert au provisioning seulement. Ensuite, `encrypt` et `decrypt` tournent **sans device** (mais avec réseau).

Pendant hackathon : c'est la primitive « un agent utilise des secrets qu'il ne peut pas exposer » (idée du brief n°1) et « Key Ring dans des environnements sans USB » (idée n°3).

## Modèle

- Clés dérivées en HKDF-SHA256 depuis une racine partagée LKRP. Chiffrement AES-256-GCM.
- `--key <name>` dérive une clé par nom. Le **même nom est obligatoire au déchiffrement**.
- Noms : libres, 253 caractères max, sans espace (`my-oss-project`, `openClaw-prod`).
- `encrypt` et `decrypt` appellent le backend LKRP à chaque invocation : réseau requis.
- Le ring se récupère depuis la seed sur une autre machine.
- Ce n'est **pas** un mécanisme de partage multi-destinataire ni de PGP.

## Commandes

```bash
# Provisioning, une seule fois, device requis. Mot de passe lu dans WALLET_PASS.
wallet-cli ring init
wallet-cli ring init --name my-laptop

# Fichier (sans device après init)
wallet-cli ring encrypt --key my-project -i .env -o .env.enc
wallet-cli ring decrypt --key my-project -i .env.enc -o .env

# Stdin/stdout (presse-papiers)
pbpaste | wallet-cli ring encrypt --key personal-notes | pbcopy

wallet-cli ring keys        # clés utilisées sur cette machine, sans device
wallet-cli ring destroy     # supprime le ring (confirmation « destroy »)
```

Sandbox Claude Code : `ring init`, `ring encrypt`, `ring decrypt`, `ring destroy` exigent `dangerouslyDisableSandbox: true` (accès keychain et réseau). `ring keys` non.

## Mot de passe : règle absolue

Le mot de passe est fourni par le développeur, jamais par l'agent.

```bash
# macOS
WALLET_PASS=$(security find-generic-password -a default -s ledger-wallet-cli -w) wallet-cli ring encrypt --key my-project -i .env -o .env.enc

# Linux
WALLET_PASS=$(secret-tool lookup service ledger-wallet-cli account default) wallet-cli ring decrypt --key my-project -i .env.enc -o .env
```

- Jamais de `WALLET_PASS=hunter2 wallet-cli …` : le littéral finit dans l'historique shell, `ps`, les logs CI et la transcription de l'agent. Ça vaut aussi pour les mots de passe de test.
- Pour créer le secret : demander à l'utilisateur de le stocker dans son trousseau (`security add-generic-password -a default -s ledger-wallet-cli -w`). L'agent ne le tape pas.
- `ring destroy` refuse de s'exécuter si `WALLET_PASS` est défini mais vide (lookup trousseau raté). C'est voulu.

## Ne jamais afficher le clair

`ring decrypt` produit des secrets. Ne pas faire `cat` du fichier déchiffré, ne pas l'imprimer, ne pas le passer en `--output json` dans un log. Rediriger vers un fichier, un pipe ou une variable d'environnement.

## Cycle de vie

- **Rotation** : retirer un membre Ledger Sync fait tourner la clé. Les données chiffrées avant ne se déchiffrent plus (erreur « Ledger Key Ring rotated »). Rechiffrer avant de retirer un membre.
- **Perte du mot de passe** : irrécupérable. Nouvelle machine, même seed, `ring init`, nouveau mot de passe.
- **Unsecure** : `ring init --unsecure-no-password` ne protège rien. Ne jamais l'utiliser avec de vraies données.

## Pattern type pour un agent

1. Le développeur provisionne le ring et stocke le mot de passe dans le trousseau.
2. Le secret chiffré (`.env.enc`) est commité ou transporté, le clair ne l'est jamais.
3. L'agent exécute `ring decrypt -o <fichier-tmp>` avec injection `$(…)`, utilise le fichier, puis le supprime.
4. Frontière : l'agent lit un secret, il ne peut pas l'exfiltrer sans que le clair apparaisse en sortie. Le noter dans le README (voir `rules/12-agent-human-boundary.md`).
