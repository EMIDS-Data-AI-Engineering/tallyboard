import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { webRoot } from "./webRoot";

const CONTRACT_FILE = "persistence-sync-v1.json";

describe("sync contract", () => {
  it("the pinned copy matches contracts/ at the repository root", () => {
    const pinned = readFileSync(join(webRoot, "contracts", CONTRACT_FILE), "utf8");
    const source = readFileSync(join(webRoot, "..", "contracts", CONTRACT_FILE), "utf8");

    expect(JSON.parse(pinned)).toEqual(JSON.parse(source));
  });

  it("defines PUT and GET on /v1/records/{key}", () => {
    const contract = JSON.parse(readFileSync(join(webRoot, "contracts", CONTRACT_FILE), "utf8"));

    expect(Object.keys(contract.paths["/v1/records/{key}"]).sort()).toEqual(["get", "put"]);
  });
});
