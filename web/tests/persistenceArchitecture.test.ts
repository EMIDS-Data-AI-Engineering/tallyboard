import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { webRoot } from "./webRoot";

const policyFile = resolve(webRoot, "src", "persistence", "persistenceService.ts");
const allowedImports = ["./ports", "./persistenceError"];

function importedModules(source: string): string[] {
  return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
}

describe("persistence architecture", () => {
  it("persistenceService imports only ports and the error module", () => {
    const imports = importedModules(readFileSync(policyFile, "utf8"));

    expect(imports.filter((module) => !allowedImports.includes(module))).toEqual([]);
  });
});
