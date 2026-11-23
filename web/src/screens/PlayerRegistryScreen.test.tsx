// @vitest-environment happy-dom
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderAt } from "../../tests/support/routing";

afterEach(cleanup);

const FILTER_LABEL = "Filter players";

function typeFilter(value: string) {
  fireEvent.change(screen.getByLabelText(FILTER_LABEL), { target: { value } });
}

function filterValue() {
  return (screen.getByLabelText(FILTER_LABEL) as HTMLInputElement).value;
}

describe("Player Registry filter", () => {
  it("writes typing to the ?q= search param without adding a history entry", async () => {
    const { router } = await renderAt("/players");

    typeFilter("ali");

    expect(router.state.location.search).toBe("?q=ali");
    expect(router.state.historyAction).toBe("REPLACE");
    expect(router.state.location.pathname).toBe("/players");
  });

  it("pre-fills the filter from a deep link to /players?q=ali", async () => {
    await renderAt("/players?q=ali");

    expect(filterValue()).toBe("ali");
  });

  it("removes q from the URL when the filter is cleared", async () => {
    const { router } = await renderAt("/players?q=ali");

    typeFilter("");

    expect(router.state.location.search).toBe("");
  });

  it("restores Player Registry with its filter intact when going back from another screen", async () => {
    const { router } = await renderAt("/players");
    typeFilter("ali");

    await act(() => router.navigate("/games"));
    expect(await screen.findByRole("heading", { level: 1, name: "Saved Games" })).toBeTruthy();
    await act(() => router.navigate(-1));

    expect(await screen.findByRole("heading", { level: 1, name: "Player Registry" })).toBeTruthy();
    expect(filterValue()).toBe("ali");
    expect(router.state.location.search).toBe("?q=ali");
  });

  it("restores the previous screen when going back from a screen reached by navigation", async () => {
    const { router } = await renderAt("/games");

    await act(() => router.navigate("/players"));
    expect(await screen.findByRole("heading", { level: 1, name: "Player Registry" })).toBeTruthy();
    await act(() => router.navigate(-1));

    expect(await screen.findByRole("heading", { level: 1, name: "Saved Games" })).toBeTruthy();
  });

  it("labels the filter input and has no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderAt("/players");

    expect(screen.getByLabelText(FILTER_LABEL)).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });
});
