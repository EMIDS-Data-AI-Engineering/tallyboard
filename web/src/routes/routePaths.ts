export const ROUTE_PATHS = Object.freeze({
  home: "/",
  createGame: "/games/new",
  savedGames: "/games",
  scoreboard: "/games/:gameId",
  addPlayers: "/games/:gameId/players",
  scoreEntry: "/games/:gameId/score",
  roundSummary: "/games/:gameId/rounds/:round",
  gameSummary: "/games/:gameId/summary",
  resumeGame: "/games/:gameId/resume",
  gameHistoryDetail: "/games/:gameId/history",
  playerRegistry: "/players",
  notFound: "*",
});
