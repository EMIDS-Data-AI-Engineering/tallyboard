// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

const appModule = "./App";

afterEach(cleanup);

async function renderApp() {
  const { default: App } = await import(/* @vite-ignore */ appModule);
  return render(<App />);
}

describe("App", () => {
  it("renders the Home screen at the root URL through the browser router", async () => {
    await renderApp();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe("Home");
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("renders Create New Game and View Saved Games buttons at the root URL", async () => {
    await renderApp();

    expect(screen.getByRole("button", { name: "Create New Game" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /View Saved Games/ })).toBeTruthy();
  });

  it("has no axe accessibility violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderApp();
    expect(container.querySelector("h1")?.textContent?.trim()).toBe("Home");

    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
