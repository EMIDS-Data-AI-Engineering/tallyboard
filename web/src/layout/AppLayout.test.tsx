// @vitest-environment happy-dom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderAt } from "../../tests/support/routing";

afterEach(cleanup);

describe("AppLayout", () => {
  it("wraps the routed screen in exactly one main landmark", async () => {
    await renderAt("/players");

    const main = screen.getByRole("main");
    expect(main.id).toBe("main-content");
    expect(main.querySelector("h1")?.textContent?.trim()).toBe("Player Registry");
  });

  it("provides a skip link targeting the main landmark", async () => {
    await renderAt("/");

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink.getAttribute("href")).toBe("#main-content");
  });

  it("has no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderAt("/");
    expect(screen.queryByRole("main")).not.toBeNull();

    expect((await axe(container)).violations).toEqual([]);
  });
});
