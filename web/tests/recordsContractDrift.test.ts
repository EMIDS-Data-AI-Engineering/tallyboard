import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { webRoot } from "./webRoot";

const contractFile = "records-v1.openapi.json";

describe("records contract", () => {
  it("pinned web copy matches contracts/records-v1.openapi.json", () => {
    const authoritative = readFileSync(resolve(webRoot, "..", "contracts", contractFile), "utf8");
    const pinned = readFileSync(resolve(webRoot, "contracts", contractFile), "utf8");

    expect(JSON.parse(pinned)).toEqual(JSON.parse(authoritative));
  });
});
