import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { webRoot } from "./webRoot";

function readJson(fileName: string) {
  return JSON.parse(readFileSync(join(webRoot, fileName), "utf8"));
}

describe("dependency manifest", () => {
  it("lockfile exists and lists every declared dependency at a version satisfying package.json", () => {
    const manifest = readJson("package.json");
    const lockfile = readJson("package-lock.json");
    const declared = { ...manifest.dependencies, ...manifest.devDependencies };
    expect(Object.keys(declared).length).toBeGreaterThan(0);

    for (const [name, range] of Object.entries<string>(declared)) {
      const locked = lockfile.packages[`node_modules/${name}`];
      expect(locked, `${name} missing from lockfile`).toBeDefined();
      const lockedMajor = locked.version.split(".")[0];
      const rangeMajor = range.replace(/^[^\d]*/, "").split(".")[0];
      expect(lockedMajor, `${name} ${locked.version} vs ${range}`).toBe(rangeMajor);
    }
  });

  it("declares a supported Node engine", () => {
    const manifest = readJson("package.json");

    expect(manifest.engines?.node).toMatch(/\d+/);
  });
});
