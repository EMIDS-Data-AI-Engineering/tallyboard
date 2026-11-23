// @vitest-environment happy-dom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderAt, SCREEN_EXPECTATIONS } from "../../tests/support/routing";

afterEach(cleanup);

const UNKNOWN_PATHS = ["/does-not-exist", "/games/game-1/unknown", "/games/game-1/rounds"];

function currentHeading() {
  const headings = screen.getAllByRole("heading", { level: 1 });
  expect(headings).toHaveLength(1);
  return headings[0].textContent?.trim();
}

describe("route table: defined screens", () => {
  it.each(SCREEN_EXPECTATIONS)("renders the %s screen at %s", async (title, path) => {
    await renderAt(path);

    expect(currentHeading()).toBe(title);
  });

  it("renders Create New Game at /games/new rather than treating 'new' as a gameId", async () => {
    await renderAt("/games/new");

    expect(currentHeading()).toBe("Create New Game");
  });

  it.each(SCREEN_EXPECTATIONS)("renders the %s screen inside the single main landmark", async (title, path) => {
    await renderAt(path);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main").querySelector("h1")?.textContent?.trim()).toBe(title);
  });

  it.each(SCREEN_EXPECTATIONS)("has no axe violations on the %s screen at %s", async (_title, path) => {
    const { axe } = await import("jest-axe");
    const { container } = await renderAt(path);
    expect(container.querySelector("h1")).not.toBeNull();

    expect((await axe(container)).violations).toEqual([]);
  });
});

describe("route table: unknown paths", () => {
  it.each(UNKNOWN_PATHS)("shows the not-found screen for %s", async (path) => {
    await renderAt(path);

    expect(currentHeading()).toBe("Page not found");
  });

  it("links the not-found screen back to Home at '/'", async () => {
    await renderAt("/does-not-exist");

    const link = screen.getByRole("link", { name: "Back to Home" });
    expect(link.getAttribute("href")).toBe("/");
  });

  it("renders the Home screen after following the not-found Home link", async () => {
    await renderAt("/does-not-exist");

    fireEvent.click(screen.getByRole("link", { name: "Back to Home" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeTruthy();
  });

  it("has no axe violations on the not-found screen", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderAt("/does-not-exist");
    expect(container.querySelector("h1")?.textContent).toBe("Page not found");

    expect((await axe(container)).violations).toEqual([]);
  });
});

describe("route table: Home navigation", () => {
  it("navigates from Home to Create New Game when Create New Game is tapped", async () => {
    const { router } = await renderAt("/");

    fireEvent.click(screen.getByRole("button", { name: "Create New Game" }));

    expect(router.state.location.pathname).toBe("/games/new");
    expect(await screen.findByRole("heading", { level: 1, name: "Create New Game" })).toBeTruthy();
  });

  it("navigates from Home to Saved Games when View Saved Games is tapped", async () => {
    const { router } = await renderAt("/", [{ id: "game-1" }]);

    fireEvent.click(screen.getByRole("button", { name: /View Saved Games/ }));

    expect(router.state.location.pathname).toBe("/games");
    expect(await screen.findByRole("heading", { level: 1, name: "Saved Games" })).toBeTruthy();
  });

  it("navigates to Saved Games from Home even when no games are stored", async () => {
    const { router } = await renderAt("/", []);

    fireEvent.click(screen.getByRole("button", { name: /View Saved Games/ }));

    expect(router.state.location.pathname).toBe("/games");
  });
});
