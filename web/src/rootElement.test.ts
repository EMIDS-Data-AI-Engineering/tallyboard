// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";

const rootElementModule = "./rootElement";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("findRootElement", () => {
  it("returns the #root element when present", async () => {
    const { findRootElement } = await import(/* @vite-ignore */ rootElementModule);
    document.body.innerHTML = '<div id="root"></div>';

    expect(findRootElement(document)).toBe(document.getElementById("root"));
  });

  it("throws a descriptive error when #root is missing", async () => {
    const { findRootElement } = await import(/* @vite-ignore */ rootElementModule);

    expect(() => findRootElement(document)).toThrow(/#root/);
  });
});
