import type { ReactElement } from "react";
import { createRoutesFromElements, Route, type RouteObject } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import NotFoundScreen from "../screens/NotFoundScreen";
import PlaceholderScreen from "../screens/PlaceholderScreen";
import PlayerRegistryScreen from "../screens/PlayerRegistryScreen";
import { ROUTE_PATHS } from "./routePaths";

interface ScreenRoute {
  path: string;
  title: string;
  element: ReactElement;
}

function placeholder(path: string, title: string): ScreenRoute {
  return { path, title, element: <PlaceholderScreen title={title} /> };
}

export const SCREEN_ROUTES: ScreenRoute[] = [
  placeholder(ROUTE_PATHS.home, "Home"),
  placeholder(ROUTE_PATHS.createGame, "Create New Game"),
  placeholder(ROUTE_PATHS.savedGames, "Saved Games"),
  placeholder(ROUTE_PATHS.scoreboard, "Scoreboard"),
  placeholder(ROUTE_PATHS.addPlayers, "Add Players"),
  placeholder(ROUTE_PATHS.scoreEntry, "Score Entry"),
  placeholder(ROUTE_PATHS.roundSummary, "Round Summary"),
  placeholder(ROUTE_PATHS.gameSummary, "Game Summary"),
  placeholder(ROUTE_PATHS.resumeGame, "Resume Game"),
  placeholder(ROUTE_PATHS.gameHistoryDetail, "Game History Detail"),
  { path: ROUTE_PATHS.playerRegistry, title: "Player Registry", element: <PlayerRegistryScreen /> },
];

export const appRoutes: RouteObject[] = createRoutesFromElements(
  <Route element={<AppLayout />}>
    {SCREEN_ROUTES.map(({ path, element }) => (
      <Route key={path} path={path} element={element} />
    ))}
    <Route path={ROUTE_PATHS.notFound} element={<NotFoundScreen />} />
  </Route>,
);
