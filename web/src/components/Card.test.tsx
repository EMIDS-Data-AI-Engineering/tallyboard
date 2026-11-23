// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

const cardModule = "./Card";

afterEach(cleanup);

async function renderCard(props: Record<string, unknown> = {}) {
  const { Card } = await import(/* @vite-ignore */ cardModule);
  return render(<Card {...props}>Body text</Card>);
}

describe("Card", () => {
  it("renders in isolation as a region named by its title with no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderCard({ title: "Summary" });

    expect(screen.getByRole("region", { name: "Summary" })).toHaveTextContent("Body text");
    expect((await axe(container)).violations).toEqual([]);
  });

  it("renders its content without a title", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderCard();

    expect(screen.getByText("Body text")).toBeTruthy();
    expect(screen.queryByRole("heading")).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });
});
