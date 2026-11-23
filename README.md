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

## Shared UI components

`web/src/components/` holds the Button, Input, Card and Grid primitives, styled only with Tailwind v4 utilities.
Design tokens are role-named colours (`primary`, `surface`, `text`, `border`, `danger`, `focus`, `disabled`, …) in the
`@theme` block of `web/src/styles/tailwind.css`, plus the `md` breakpoint (48rem). Values are provisional placeholders;
`web/tests/designTokens.test.ts` asserts WCAG contrast for them.

Run `npm run dev` in `web/` and open `/gallery.html` to see every primitive. Manual viewport checklist:
1440, 768, 375 wide and 375x500 (the page must scroll to reach everything).
