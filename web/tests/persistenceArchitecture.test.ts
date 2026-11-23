import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { webRoot } from "./webRoot";

const POLICY_FILES = ["persistenceService.ts", "ports.ts"];
const FORBIDDEN_IMPORTS = ["localStorageStore", "httpRecordStore", "browserPersistence", "react", "axios"];

function importSpecifiers(fileName: string) {
  const source = readFileSync(join(webRoot, "src", "persistence", fileName), "utf8");
  return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
}

describe("persistence dependency rule", () => {
  it.each(POLICY_FILES)("%s imports no adapter or framework module", (fileName) => {
    const specifiers = importSpecifiers(fileName);

    for (const forbidden of FORBIDDEN_IMPORTS) {
      expect(specifiers.filter((specifier) => specifier.includes(forbidden))).toEqual([]);
    }
  });

  it("persistenceService.ts does not touch browser globals", () => {
    const source = readFileSync(join(webRoot, "src", "persistence", "persistenceService.ts"), "utf8");

    expect(source).not.toMatch(/\b(window|localStorage|document)\b/);
  });
});
