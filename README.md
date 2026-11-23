# tallyboard

- `web/` — React + TypeScript + Vite frontend.
- `api/` — FastAPI backend (added by later stories).

## Commands (run in `web/`)

- `npm ci` — install dependencies
- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a minified production bundle in `dist/`
- `npm test` — run the tests; `npm run test:coverage` adds coverage

## Component library (`web/src/components`)

`Button`, `Input`, `Card` and `Grid`, styled only with Tailwind v4 utilities. Design tokens are role-named
colour variables (`primary`, `surface`, `text`, `border`, `focus`, `disabled`, …) in the `@theme` block of
`web/src/styles/tailwind.css`; the values are provisional until brand tokens are approved. Import from
`components/index.ts`, which also loads the stylesheet.

`Input` is `type=text` with no `inputMode` (the iOS numeric keypad has no minus key); with `onIntegerChange`
it adds `pattern="-?[0-9]*"` and surfaces the parsed integer (`-5` → `-5`, `-` → `null`).

### Gallery and viewport checklist

Run `npm run dev` in `web/` and open `/gallery.html`. Check at 1440, 768, 375 and 375×500 (short viewport
must scroll to reach everything).
