import { describe, expect, it } from "vitest";
import { contrastRatio } from "./support/contrast";

describe("contrastRatio", () => {
  it("is 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("is 1:1 for identical colours", () => {
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("expands shorthand hex", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
  });
});
