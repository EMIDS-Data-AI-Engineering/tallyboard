import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes/routeTable";
import { inMemorySavedGameCatalog } from "./savedGames/SavedGameCatalog";
import { SavedGameCatalogProvider } from "./savedGames/SavedGameCatalogContext";

// Composition root. Nothing persists games yet, so the catalog is honestly empty.
const savedGameCatalog = inMemorySavedGameCatalog([]);

export default function App() {
  const [router] = useState(() => createBrowserRouter(appRoutes));
  return (
    <SavedGameCatalogProvider catalog={savedGameCatalog}>
      <RouterProvider router={router} />
    </SavedGameCatalogProvider>
  );
}
