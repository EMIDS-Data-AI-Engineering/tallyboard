// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

const screenModule = "./HomeScreen";
const routerPackage = "react-router-dom";
const contextModule = "../savedGames/SavedGameCatalogContext";
const catalogModule = "../savedGames/SavedGameCatalog";
const EMPTY_NOTICE = "No saved games yet";

afterEach(cleanup);

async function renderHome(savedGames: readonly unknown[]) {
  const { default: HomeScreen } = await import(/* @vite-ignore */ screenModule);
  const { MemoryRouter } = await import(/* @vite-ignore */ routerPackage);
  const { SavedGameCatalogProvider } = await import(/* @vite-ignore */ contextModule);
  const { inMemorySavedGameCatalog } = await import(/* @vite-ignore */ catalogModule);
  const catalog = inMemorySavedGameCatalog(savedGames);
  return render(
    createElement(
      SavedGameCatalogProvider,
      { catalog },
      createElement(MemoryRouter, null, createElement(HomeScreen)),
    ),
  );
}

describe("HomeScreen", () => {
  it("shows both primary actions before any other content", async () => {
    await renderHome([]);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toContain("Create New Game");
    expect(buttons[1].textContent).toContain("View Saved Games");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows 'No saved games yet' and keeps View Saved Games enabled and described when the catalog is empty", async () => {
    await renderHome([]);

    const button = screen.getByRole("button", { name: /View Saved Games/ }) as HTMLButtonElement;
    const notice = screen.getByText(EMPTY_NOTICE);
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("aria-describedby")).toBe(notice.id);
    expect(notice.id).not.toBe("");
  });

  it("omits the no-saved-games notice when games exist", async () => {
    await renderHome([{ id: "game-1" }]);

    expect(screen.queryByText(EMPTY_NOTICE)).toBeNull();
    expect(screen.getByRole("button", { name: /View Saved Games/ })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderHome([]);
    expect(container.querySelector("h1")?.textContent?.trim()).toBe("Home");

    expect((await axe(container)).violations).toEqual([]);
  });
});
