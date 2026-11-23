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

- `npm install && npm run setup:api` — one-time setup (needs network): creates `api/.venv` and installs `api[dev]`.
- `npm test` — runs the web suite (vitest), then pytest with coverage from the existing venv; needs no network.

## Backend (`api/`)

- The database URL is read from the `DATABASE_URL` environment variable (an `postgresql+asyncpg://` URL); it is never written to files.
- `CORS_ORIGINS` — comma-separated browser origins allowed to call the API (for example `http://localhost:5173`); required when serving, no wildcard. The web app reads the API base URL from `VITE_SYNC_API_URL`.
- `cd api && .venv/bin/alembic upgrade head` — apply migrations (schema `sync`, table `sync.records`).
- `cd api && .venv/bin/uvicorn --factory tallyboard_api.main:create_app` — serve the API.

## Component library

Shared primitives live in `web/src/components` (`Button`, `Input`, `Card`, `Grid`), styled only with Tailwind CSS v4 utilities. Import them from the barrel (`web/src/components/index.ts`), which also loads the stylesheet.

Design tokens are role-named colours in the `@theme` block of `web/src/styles/tailwind.css` (`primary`, `primary-contrast`, `secondary`, `secondary-contrast`, `surface`, `surface-muted`, `text`, `text-muted`, `border`, `danger`, `danger-contrast`, `focus`, `disabled`, `disabled-text`) plus the `md` breakpoint (48rem). The hex values are provisional placeholders; a rebrand changes only the values. `web/tests/designTokens.test.ts` computes WCAG contrast for them.

`Input` renders `type="text"` (the iOS numeric keypad has no minus key) and, when `onIntegerChange` is given, `pattern="-?[0-9]*"`. It reports the raw string via `onValueChange` and the parsed integer (or `null`) via `onIntegerChange`.

### Gallery and viewport checklist

Run `npm run dev` in `web/` and open `/gallery.html` (dev server only). Check at 1440, 768, 375 and 375x500 (the short viewport must scroll to reach everything).

## Home screen

`web/src/screens/HomeScreen.tsx` is the route at `/`. It offers **Create New Game** and **View Saved Games** first in the content; the latter stays enabled and, when no games are stored, is described by a "No saved games yet" notice. The screen reads the count through the `SavedGameCatalog` port (`web/src/savedGames`), injected by `SavedGameCatalogProvider`. `web/src/App.tsx` is the composition root and currently wires an empty in-memory catalog until a persistence adapter exists; `useSavedGameCatalog` throws if no provider is mounted.

**Live layout check (headless Chromium against `vite preview`).** At 1440x900, 768x1024, 375x667 and 375x500 both Home buttons sit fully inside the viewport (bottom edge at most 341px) with no horizontal overflow, and the 'No saved games yet' notice shows. Tapping each button lands on `/games/new` and `/games`. The Saved Games, Create New Game and Not Found routes also show no horizontal overflow at those widths.
