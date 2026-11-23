import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./support/contrast";
import { webRoot } from "./webRoot";

const MIN_TEXT_CONTRAST = 4.5;
const MIN_BOUNDARY_CONTRAST = 3;
const ROLE_TOKENS = [
  "primary", "primary-contrast", "secondary", "secondary-contrast", "surface", "surface-muted",
  "text", "text-muted", "border", "danger", "danger-contrast", "focus", "disabled", "disabled-text",
];
const TEXT_PAIRS = [
  ["primary-contrast", "primary"], ["secondary-contrast", "secondary"], ["danger-contrast", "danger"],
  ["text", "surface"], ["text-muted", "surface"], ["text", "surface-muted"], ["disabled-text", "disabled"],
  ["primary", "surface"],
];
const BOUNDARY_PAIRS = [["border", "surface"], ["focus", "surface"]];

function readTheme(): Map<string, string> {
  const css = readFileSync(resolve(webRoot, "src/styles/tailwind.css"), "utf8");
  const theme = css.match(/@theme[^{]*\{([^}]*)\}/)?.[1] ?? "";
  return new Map([...theme.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const colour = (theme: Map<string, string>, role: string) => theme.get(`color-${role}`) as string;

describe("design tokens", () => {
  it("defines every role-named colour token", () => {
    const theme = readTheme();
    for (const role of ROLE_TOKENS) expect(theme.get(`color-${role}`), role).toMatch(/^#[0-9a-fA-F]{3,6}$/);
  });

  it("defines the md breakpoint as 48rem", () => {
    expect(readTheme().get("breakpoint-md")).toBe("48rem");
  });

  it.each(TEXT_PAIRS)("%s on %s meets 4.5:1", (foreground, background) => {
    const theme = readTheme();
    expect(contrastRatio(colour(theme, foreground), colour(theme, background))).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(BOUNDARY_PAIRS)("%s on %s meets 3:1", (foreground, background) => {
    const theme = readTheme();
    expect(contrastRatio(colour(theme, foreground), colour(theme, background))).toBeGreaterThanOrEqual(MIN_BOUNDARY_CONTRAST);
  });
});
