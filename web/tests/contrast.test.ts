import { describe, expect, it } from "vitest";
import { contrastRatio } from "./support/contrast";

describe("contrast maths", () => {
  it("gives 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("gives 1:1 for identical colours", () => {
    expect(contrastRatio("#1d4ed8", "#1d4ed8")).toBeCloseTo(1, 5);
  });

  it("parses shorthand hex", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });
});
