# Clearing House web3

Dossier de travail pour un moteur de règlement DvP de parts de fonds, à deux modes (instantané par ordre, ou netting par cycle), avec signatures Ledger et agents. Il est proposé sous forme de logiciel licencié aux dépositaires et administrateurs de fonds (CACEIS comme référence, BP2S et SGSS à qualifier). Les dépositaires centraux sont une cible secondaire.

Ce dossier contient de la documentation uniquement. Aucun code de ce projet n'est présent à ce stade. Il est distinct du projet BTC copilot (voir Q-04 et Q-05 dans `QUESTIONS.md`).

## Contenu

- `cadrage.md` : hypothèses retenues, modèle de règlement à deux modes, architecture, proposition de valeur, clients visés, modèle de licence et revenus, hypothèses économiques, concurrents.
- `spec-poc.md` : spec du POC pour le hackathon (cas d'usage, parcours de démo, périmètre, stack figée, replis).
- `diagramme-technique.md` : vue d'ensemble, séquence de démo, actions manuelles par phase.
- `stories/` : backlog Agile du POC (8 epics, 42 stories, ordre d'exécution, coupes en cas de retard).
- `QUESTIONS.md` : questions ouvertes avec statut, et questions réglées.
- `presentation/plan-presentation.html` : plan de présentation en 22 slides (vulgarisation, parcours d'un ordre, termes, clients visés, technique, suite).

## Statut

- Date de création : 10 octobre 2026.
- Périmètre du POC : figé. Points restants : voir `QUESTIONS.md`.
- Prochaine étape : test Clear Signing sur Flex (S-006), première tâche du backlog.
