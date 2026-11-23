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

## Component library

Shared primitives live in `web/src/components` (`Button`, `Input`, `Card`, `Grid`), styled only with Tailwind CSS v4 utilities. Import them from the barrel (`web/src/components/index.ts`), which also loads the stylesheet.

Design tokens are role-named colours in the `@theme` block of `web/src/styles/tailwind.css` (`primary`, `primary-contrast`, `secondary`, `secondary-contrast`, `surface`, `surface-muted`, `text`, `text-muted`, `border`, `danger`, `danger-contrast`, `focus`, `disabled`, `disabled-text`) plus the `md` breakpoint (48rem). The hex values are provisional placeholders; a rebrand changes only the values. `web/tests/designTokens.test.ts` computes WCAG contrast for them.

`Input` renders `type="text"` (the iOS numeric keypad has no minus key) and, when `onIntegerChange` is given, `pattern="-?[0-9]*"`. It reports the raw string via `onValueChange` and the parsed integer (or `null`) via `onIntegerChange`.

### Gallery and viewport checklist

Run `npm run dev` in `web/` and open `/gallery.html` (dev server only). Check at 1440, 768, 375 and 375x500 (the short viewport must scroll to reach everything).

## Home screen

`web/src/screens/HomeScreen.tsx` is the route at `/`. It offers **Create New Game** and **View Saved Games** first in the content; the latter stays enabled and, when no games are stored, is described by a "No saved games yet" notice. The screen reads the count through the `SavedGameCatalog` port (`web/src/savedGames`), injected by `SavedGameCatalogProvider`. `web/src/App.tsx` is the composition root and currently wires an empty in-memory catalog until a persistence adapter exists; `useSavedGameCatalog` throws if no provider is mounted.

**Live layout check (headless Chromium against `vite preview`).** At 1440x900, 768x1024, 375x667 and 375x500 both Home buttons sit fully inside the viewport (bottom edge at most 341px) with no horizontal overflow, and the 'No saved games yet' notice shows. Tapping each button lands on `/games/new` and `/games`. The Saved Games, Create New Game and Not Found routes also show no horizontal overflow at those widths.
