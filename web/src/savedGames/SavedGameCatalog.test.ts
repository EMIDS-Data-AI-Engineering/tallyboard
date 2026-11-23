import { describe, expect, it } from "vitest";

const catalogModule = "./SavedGameCatalog";

async function catalogOf(games: readonly unknown[]) {
  const { inMemorySavedGameCatalog } = await import(/* @vite-ignore */ catalogModule);
  return inMemorySavedGameCatalog(games);
}

describe("inMemorySavedGameCatalog", () => {
  it("counts zero saved games when nothing is stored", async () => {
    expect((await catalogOf([])).countSavedGames()).toBe(0);
  });

  it("counts every stored game", async () => {
    const catalog = await catalogOf([{ id: "game-1" }, { id: "game-2" }, { id: "game-3" }]);

    expect(catalog.countSavedGames()).toBe(3);
  });
});
