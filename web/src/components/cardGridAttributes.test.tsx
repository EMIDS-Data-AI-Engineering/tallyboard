// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "./Card";
import { Grid } from "./Grid";

afterEach(cleanup);

describe("Card", () => {
  it("merges className with its own classes and passes other attributes through", () => {
    render(<Card title="Scores" className="extra-class" data-testid="card" id="scores-card">Body</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("extra-class");
    expect(card.className).toContain("bg-surface");
    expect(card.id).toBe("scores-card");
  });
});

describe("Grid", () => {
  it("merges className with its own classes and passes other attributes through", () => {
    render(<Grid columns={2} className="extra-class" data-testid="grid" aria-label="Players">Body</Grid>);
    const grid = screen.getByTestId("grid");
    expect(grid.className).toContain("extra-class");
    expect(grid.className).toContain("md:grid-cols-2");
    expect(grid.getAttribute("aria-label")).toBe("Players");
  });
});
