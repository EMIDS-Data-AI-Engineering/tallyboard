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

Shared primitives live in `web/src/components` (`Button`, `Input`, `Card`, `Grid`) and are styled only with Tailwind CSS v4 utilities. Import them from the barrel (`components/index.ts`), which also loads the stylesheet.

Design tokens are the `@theme` block in `web/src/styles/tailwind.css`, named by role: `primary`, `primary-contrast`, `secondary`, `secondary-contrast`, `surface`, `surface-muted`, `text`, `text-muted`, `border`, `danger`, `danger-contrast`, `focus`, `disabled`, `disabled-text`, plus the `md` breakpoint (`48rem`). The colour values are provisional placeholders that pass the computed WCAG contrast tests; a rebrand changes only the values.

`Input` renders `type="text"` (the iOS numeric keypad has no minus key) and, given `onIntegerChange`, the pattern `-?[0-9]*`. It reports the raw string via `onValueChange` and the parsed integer (or `null`) via `onIntegerChange`.

### Manual viewport checklist

Run `npm run dev` in `web/` and open `/gallery.html` (dev server only). Check at 1440px, 768px, 375px and 375x500 (the short viewport must scroll to reach everything).
