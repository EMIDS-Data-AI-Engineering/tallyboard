export interface SavedGameCatalog {
  countSavedGames(): number;
}

export function inMemorySavedGameCatalog(games: readonly unknown[]): SavedGameCatalog {
  return { countSavedGames: () => games.length };
}
