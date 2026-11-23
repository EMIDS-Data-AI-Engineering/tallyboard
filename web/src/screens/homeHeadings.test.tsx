// @vitest-environment happy-dom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderAt } from "../../tests/support/routing";

afterEach(cleanup);

describe("Home heading levels", () => {
  it("keeps h1 Home and makes the hero title an h2 in the heading font", async () => {
    await renderAt("/");

    expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeTruthy();
    const hero = screen.getByRole("heading", { level: 2, name: "Track every point. Every round." });
    expect(hero.className).toContain("font-heading");
  });
});
