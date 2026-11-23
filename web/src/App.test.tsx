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
  it("renders the application heading", async () => {
    await renderApp();

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).not.toBe("");
    expect(screen.getByRole("main")).toBeTruthy();
  });

  it("has no axe accessibility violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderApp();
    expect(container.querySelector("h1")).not.toBeNull();

    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
