import { createContext, useContext, type ReactNode } from "react";
import type { SavedGameCatalog } from "./SavedGameCatalog";

const SavedGameCatalogContext = createContext<SavedGameCatalog | null>(null);

interface SavedGameCatalogProviderProps {
  catalog: SavedGameCatalog;
  children: ReactNode;
}

export function SavedGameCatalogProvider({ catalog, children }: SavedGameCatalogProviderProps) {
  return <SavedGameCatalogContext.Provider value={catalog}>{children}</SavedGameCatalogContext.Provider>;
}

export function useSavedGameCatalog(): SavedGameCatalog {
  const catalog = useContext(SavedGameCatalogContext);
  if (catalog === null) {
    throw new Error("useSavedGameCatalog requires a SavedGameCatalogProvider; no catalog is configured.");
  }
  return catalog;
}
