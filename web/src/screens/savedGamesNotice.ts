export const NO_SAVED_GAMES_NOTICE = "No saved games yet";

export function savedGamesNotice(savedGameCount: number): string | null {
  return savedGameCount === 0 ? NO_SAVED_GAMES_NOTICE : null;
}
