# tallyboard

- `web/` — React + TypeScript + Vite frontend.
- `api/` — FastAPI backend (added by later stories).

## Commands (run in `web/`)

- `npm ci` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a minified production bundle in `dist/`
- `npm test` — run the tests; `npm run test:coverage` adds coverage

## Component library (`web/src/components`)

Tailwind CSS v4 primitives: `Button` (primary/secondary/danger, native `disabled`), `Input` (labelled; `onIntegerChange` enables integer mode and accepts negatives), `Card`, `Grid` (one column below `md`, `columns` 1-4 at `md` and up). Import from `web/src/components` (the barrel loads the stylesheet).

Design tokens are role-named colours plus the `md` breakpoint (48rem) in an `@theme` block in `web/src/styles/tailwind.css`. Values are provisional until brand tokens are approved; `tests/designTokens.test.ts` computes WCAG contrast for them.

### Gallery and viewport checklist

Run `npm run dev` in `web/` and open `/gallery.html` (dev server only). Check at 1440px, 768px, 375px and 375x500 (the page must scroll to reach everything).
