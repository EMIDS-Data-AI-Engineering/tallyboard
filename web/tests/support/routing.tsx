import { render } from "@testing-library/react";
import { createElement } from "react";

// Modules are loaded at call time so a missing module fails the calling test only.
const routerPackage = "react-router-dom";
const routeTableModule = "../../src/routes/routeTable";

export const SAMPLE_GAME_ID = "game-1";

export const SCREEN_EXPECTATIONS: ReadonlyArray<readonly [string, string]> = [
  ["Home", "/"],
  ["Create New Game", "/games/new"],
  ["Saved Games", "/games"],
  ["Scoreboard", `/games/${SAMPLE_GAME_ID}`],
  ["Add Players", `/games/${SAMPLE_GAME_ID}/players`],
  ["Score Entry", `/games/${SAMPLE_GAME_ID}/score`],
  ["Round Summary", `/games/${SAMPLE_GAME_ID}/rounds/2`],
  ["Game Summary", `/games/${SAMPLE_GAME_ID}/summary`],
  ["Resume Game", `/games/${SAMPLE_GAME_ID}/resume`],
  ["Game History Detail", `/games/${SAMPLE_GAME_ID}/history`],
  ["Player Registry", "/players"],
];

export async function renderAt(path: string) {
  const { createMemoryRouter, RouterProvider } = await import(/* @vite-ignore */ routerPackage);
  const { appRoutes } = await import(/* @vite-ignore */ routeTableModule);
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const view = render(createElement(RouterProvider, { router }));
  return { router, ...view };
}
