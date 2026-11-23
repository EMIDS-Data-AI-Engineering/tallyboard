import { useNavigate } from "react-router-dom";
import { Button } from "../components";
import { ROUTE_PATHS } from "../routes/routePaths";
import { useSavedGameCatalog } from "../savedGames/SavedGameCatalogContext";
import { savedGamesNotice } from "./savedGamesNotice";

const SAVED_GAMES_NOTICE_ID = "saved-games-notice";

export default function HomeScreen() {
  const navigate = useNavigate();
  const notice = savedGamesNotice(useSavedGameCatalog().countSavedGames());

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-text">Home</h1>
      <section aria-label="Primary actions" className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Score tracker for game nights</p>
        <h2 className="font-heading text-lg text-text">Track every point. Every round.</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(ROUTE_PATHS.createGame)}>Create New Game</Button>
          <Button
            variant="secondary"
            aria-describedby={notice ? SAVED_GAMES_NOTICE_ID : undefined}
            onClick={() => navigate(ROUTE_PATHS.savedGames)}
          >
            View Saved Games
          </Button>
        </div>
        {notice && (
          <p id={SAVED_GAMES_NOTICE_ID} className="text-sm text-text-muted">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}
