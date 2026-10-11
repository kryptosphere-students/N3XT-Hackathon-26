# clearing-house-web3

Code du POC : moteur de règlement DvP de parts de fonds à deux modes, avec signatures Ledger et agents.

Monorepo npm (workspaces) :

- `contracts/` : Foundry, OpenZeppelin et forge-std via npm.
- `packages/engine/` : moteur TypeScript pur, `@chw3/engine`.
- `apps/server/` : API Fastify et agents, `@chw3/server`.
- `apps/web/` : Vite, React, DMK, `@chw3/web`. Contient la page de test Flex (S-005, S-006).

```bash
cp .env.example .env
npm install
npm test
npm run lint
npm run dev -w apps/server
npm run dev -w apps/web
```

`forge` doit être dans le PATH pour `npm test` (voir `docs-clearing-house-web3/dev/SETUP.md`).

- Démarrer : `docs-clearing-house-web3/dev/README.md`
- Arborescence : `docs-clearing-house-web3/dev/ARBORESCENCE.md`
- Variables à remplir : `docs-clearing-house-web3/dev/PLACEHOLDERS.md`
