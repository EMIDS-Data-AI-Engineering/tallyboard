# tallyboard

- `web/` — React + TypeScript + Vite frontend.
- `api/` — FastAPI backend (added by later stories).

## Commands (run in `web/`)

- `npm ci` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a minified production bundle in `dist/`
- `npm test` — run the tests; `npm run test:coverage` adds coverage

## Routing

Routes are defined in `web/src/routes/routePaths.ts` (URL paths) and `web/src/routes/routeTable.tsx` (screens). Register new screens there.

## Persistence and sync

`web/src/persistence` saves to localStorage first and then syncs to the API (`contracts/records-v1.openapi.json`; `web/contracts/` holds the pinned copy). localStorage always wins on read; a key missing locally is restored from the backend.

API commands (run in `api/`; the system Python is externally managed, so use a venv):

- `python3 -m venv .venv && .venv/bin/pip install -e '.[dev]'` — install
- `.venv/bin/pytest` — run the tests (no network or database needed)
- `DATABASE_URL=<asyncpg URL> .venv/bin/alembic upgrade head` — apply migrations (never run at startup)
- `DATABASE_URL=<asyncpg URL> .venv/bin/uvicorn --factory tallyboard_api.main:create_app` — serve the API
