// @vitest-environment happy-dom
import { cleanup, render, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const contextModule = "./SavedGameCatalogContext";

afterEach(cleanup);

describe("useSavedGameCatalog", () => {
  it("returns the catalog injected through the provider", async () => {
    const { SavedGameCatalogProvider, useSavedGameCatalog } = await import(/* @vite-ignore */ contextModule);
    const catalog = { countSavedGames: () => 7 };
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(SavedGameCatalogProvider, { catalog }, children);

    const { result } = renderHook(() => useSavedGameCatalog(), { wrapper });

    expect(result.current).toBe(catalog);
  });

  it("throws when no provider is mounted so a missing integration fails loudly", async () => {
    const { useSavedGameCatalog } = await import(/* @vite-ignore */ contextModule);
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Probe() {
      useSavedGameCatalog();
      return null;
    }

    expect(() => render(createElement(Probe))).toThrow();
  });
});
