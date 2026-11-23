import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./support/contrast";
import { webRoot } from "./webRoot";

const MIN_BACKGROUND_DIFFERENCE = 1.5;
const css = readFileSync(resolve(webRoot, "src/styles/tailwind.css"), "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!match) throw new Error(`missing token ${name}`);
  return match[1];
}

describe("disabled background versus variants", () => {
  it.each(["primary", "secondary", "danger"])("differs from the %s background", (variant) => {
    expect(contrastRatio(token("disabled"), token(variant))).toBeGreaterThanOrEqual(MIN_BACKGROUND_DIFFERENCE);
  });
});
