// @vitest-environment happy-dom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderAt } from "../../tests/support/routing";

afterEach(cleanup);

describe("Player Registry filter", () => {
  it("separates the label from its input and keeps them associated", async () => {
    await renderAt("/players");

    const input = screen.getByLabelText("Filter players");
    expect(input.id).toBe("player-filter");
    expect(document.querySelector('label[for="player-filter"]')?.className).toContain("mr-3");
  });
});
