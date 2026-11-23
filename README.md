# tallyboard

- `web/` — React + TypeScript + Vite frontend.
- `api/` — FastAPI backend: key-value records sync endpoint (`PUT`/`GET /v1/records/{key}`) backed by PostgreSQL.
- `contracts/` — versioned service contracts; `web/contracts/` holds the web's pinned copy.

## Commands (run in `web/`)

- `npm ci` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a minified production bundle in `dist/`
- `npm test` — run the tests; `npm run test:coverage` adds coverage

## Routing

Routes are defined in `web/src/routes/routePaths.ts` (URL paths) and `web/src/routes/routeTable.tsx` (screens). Register new screens there.

## Running all tests (from the repo root)

- `npm install && npm test` — runs the web suite (vitest), then creates `api/.venv`, installs `api[dev]` and runs pytest with coverage.

## Backend (`api/`)

- The database URL is read from the `DATABASE_URL` environment variable (an `postgresql+asyncpg://` URL); it is never written to files.
- `cd api && .venv/bin/alembic upgrade head` — apply migrations (schema `sync`, table `sync.records`).
- `cd api && .venv/bin/uvicorn --factory tallyboard_api.main:create_app` — serve the API.
