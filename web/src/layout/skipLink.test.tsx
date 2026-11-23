// @vitest-environment happy-dom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderAt } from "../../tests/support/routing";

afterEach(cleanup);

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";

describe("skip link", () => {
  it("is the first focusable element and still targets #main-content", async () => {
    const { container } = await renderAt("/");
    const skipLink = screen.getByRole("link", { name: "Skip to main content" });

    expect(container.querySelector(FOCUSABLE)).toBe(skipLink);
    expect(skipLink.getAttribute("href")).toBe("#main-content");
    expect(document.getElementById("main-content")).not.toBeNull();
  });

  it("is visually hidden until focused, then shown with a focus ring", async () => {
    await renderAt("/");
    const classes = screen.getByRole("link", { name: "Skip to main content" }).className.split(" ");

    expect(classes).toContain("sr-only");
    expect(classes).toEqual(expect.arrayContaining(["focus:not-sr-only", "focus:absolute", "focus:outline-2", "focus:outline-focus"]));
  });
});
