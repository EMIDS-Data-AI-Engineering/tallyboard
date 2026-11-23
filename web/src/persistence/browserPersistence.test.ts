import { describe, expect, it } from "vitest";

describe("createBrowserPersistence", () => {
  it("creating the service without VITE_SYNC_API_URL throws a descriptive error", async () => {
    const { createBrowserPersistence } = await import("./browserPersistence");

    expect(() => createBrowserPersistence({})).toThrowError(/VITE_SYNC_API_URL/);
  });

  it("creates a service when VITE_SYNC_API_URL is configured", async () => {
    const { createBrowserPersistence } = await import("./browserPersistence");

    const service = createBrowserPersistence({ VITE_SYNC_API_URL: "https://sync.example.com" });

    expect(typeof service.save).toBe("function");
  });
});
