import { describe, expect, it } from "vitest";

const routePathsModule = "./routePaths";
const routerPackage = "react-router-dom";

async function loadPaths(): Promise<Record<string, string>> {
  const { ROUTE_PATHS } = await import(/* @vite-ignore */ routePathsModule);
  return ROUTE_PATHS;
}

describe("ROUTE_PATHS", () => {
  it("defines a unique path for every named route", async () => {
    const paths = Object.values(await loadPaths());

    expect(paths.length).toBeGreaterThanOrEqual(12);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("makes every path absolute except the catch-all", async () => {
    const paths = Object.values(await loadPaths());

    for (const path of paths) {
      expect(path === "*" || path.startsWith("/")).toBe(true);
    }
  });

  it("builds concrete urls for parameterised paths", async () => {
    const { generatePath } = await import(/* @vite-ignore */ routerPackage);
    const paths = await loadPaths();

    expect(generatePath(paths.scoreboard, { gameId: "game-1" })).toBe("/games/game-1");
    expect(generatePath(paths.roundSummary, { gameId: "game-1", round: "2" })).toBe(
      "/games/game-1/rounds/2",
    );
  });
});
