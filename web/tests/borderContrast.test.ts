import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./support/contrast";
import { webRoot } from "./webRoot";

const MIN_BOUNDARY_CONTRAST = 3;
const css = readFileSync(join(webRoot, "src/styles/tailwind.css"), "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token ${name} not found`);
  return match[1];
}

describe("border token", () => {
  it.each(["surface", "surface-muted"])("has at least 3:1 contrast against %s", (background) => {
    expect(contrastRatio(token("border"), token(background))).toBeGreaterThanOrEqual(MIN_BOUNDARY_CONTRAST);
  });
});
