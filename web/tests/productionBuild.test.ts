import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { webConfigFile, webRoot } from "./webRoot";

type BuildOutput = { outDir: string; html: string; scripts: string[] };

let cachedBuild: Promise<BuildOutput> | undefined;

async function runProductionBuild(): Promise<BuildOutput> {
  const { build } = await import("vite");
  const outDir = mkdtempSync(join(tmpdir(), "web-build-"));
  await build({
    root: webRoot,
    configFile: webConfigFile,
    logLevel: "silent",
    build: { outDir, emptyOutDir: true },
  });
  const html = readFileSync(join(outDir, "index.html"), "utf8");
  const scripts = readdirSync(join(outDir, "assets")).filter((f) => f.endsWith(".js"));
  return { outDir, html, scripts };
}

function productionBuild(): Promise<BuildOutput> {
  cachedBuild ??= runProductionBuild();
  return cachedBuild;
}

describe("production build", () => {
  it("emits index.html referencing hashed JS assets", async () => {
    const { html } = await productionBuild();

    expect(html).toMatch(/assets\/[\w-]+-[\w-]{8,}\.js/);
  });

  it("emits minified JavaScript", async () => {
    const { outDir, scripts } = await productionBuild();
    expect(scripts.length).toBeGreaterThan(0);

    for (const script of scripts) {
      const source = readFileSync(join(outDir, "assets", script), "utf8");
      expect(source).not.toMatch(/^[ \t]+\S/m);
    }
  });

  it("emitted index.html references only assets that exist", async () => {
    const { outDir, html } = await productionBuild();
    const references = [...html.matchAll(/(?:src|href)="\/?(assets\/[^"]+)"/g)].map((m) => m[1]);
    expect(references.length).toBeGreaterThan(0);

    for (const reference of references) {
      expect(existsSync(join(outDir, reference))).toBe(true);
    }
  });
});
