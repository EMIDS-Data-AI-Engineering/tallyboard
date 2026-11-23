import { describe, expect, it } from "vitest";
import { createBrowserPersistence } from "./browserPersistence";

describe("createBrowserPersistence", () => {
  it("reads the base URL from VITE_SYNC_API_URL and fails loudly when it is missing", async () => {
    window.localStorage.clear();
    const service = createBrowserPersistence({}, window.localStorage);
    await expect(service.save("score", 1)).rejects.toMatchObject({ kind: "sync-unconfigured", localValueKept: true });
    expect(window.localStorage.getItem("score")).toBe("1");
  });
});
