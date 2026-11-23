# tallyboard

- `web/` — React + TypeScript + Vite frontend.
- `api/` — FastAPI backend (added by later stories).

## Commands (run in `web/`)

- `npm ci` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a minified production bundle in `dist/`
- `npm test` — run the tests; `npm run test:coverage` adds coverage

## UI component library

Primitives (`Button`, `Input`, `Card`, `Grid`) live in `web/src/components/` and are styled with Tailwind CSS v4. Design tokens are role-named colours in the `@theme` block of `web/src/styles/tailwind.css` (primary, secondary, surface, text, border, danger, focus, disabled and their contrast pairs) plus the `md` breakpoint at 48rem. The values are provisional until brand tokens are approved; `web/tests/designTokens.test.ts` checks their WCAG contrast.

Run `npm run dev` in `web/` and open `/gallery.html` to see every primitive. Manual viewport checklist: 1440, 768, 375 and 375x500 (the short viewport must scroll to reach everything).
