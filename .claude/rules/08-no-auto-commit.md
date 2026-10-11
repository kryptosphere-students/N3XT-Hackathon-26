# Ne jamais committer ni pousser

Yohan commite et pousse **toujours** manuellement. Claude s'arrête à un working
tree propre et rend la main.

## Interdit sans demande explicite

- `git commit`, y compris `--amend`.
- `git push`, sous toutes ses formes (`--force`, `--force-with-lease`).
- Toute réécriture d'historique : `rebase`, `reset --hard`, `filter-branch`.
- Ouvrir une PR (`gh pr create`).

## À la place

Terminer le travail, laisser les modifications dans le working tree, et annoncer
en une ligne ce qui reste à committer. Proposer un message de commit dans le chat
si c'est utile — jamais en l'exécutant.

## Exception

Uniquement sur demande explicite, et pour ce commit-là (« commit ça », « push »).
Une autorisation ne vaut jamais pour les suivants.

Source : feedback utilisateur 2026-09-12 — commit puis push automatiques sur
`feature/bulletin-miniature`, laissant un trailer `Co-Authored-By` non désiré
dans un historique public.
