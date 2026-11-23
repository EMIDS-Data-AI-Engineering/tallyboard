import { beforeEach, describe, expect, it } from "vitest";

function failingStorage(method: "getItem" | "setItem") {
  const storage = {
    getItem: () => null,
    setItem: () => undefined,
  };
  storage[method] = () => {
    throw new DOMException("denied", "QuotaExceededError");
  };
  return storage as unknown as Storage;
}

describe("LocalStorageStore", () => {
  beforeEach(() => window.localStorage.clear());

  it("writes and reads raw strings through the given storage", async () => {
    const { LocalStorageStore } = await import("./localStorageStore");
    const store = new LocalStorageStore(window.localStorage);

    store.setItem("key", "value");

    expect(store.getItem("key")).toBe("value");
    expect(store.getItem("absent")).toBeNull();
  });

  it("turns a failing write into a local-write-failed error", async () => {
    const { LocalStorageStore } = await import("./localStorageStore");
    const store = new LocalStorageStore(failingStorage("setItem"));

    expect(() => store.setItem("key", "value")).toThrowError(
      expect.objectContaining({ kind: "local-write-failed" }),
    );
  });

  it("turns a failing read into a local-read-failed error", async () => {
    const { LocalStorageStore } = await import("./localStorageStore");
    const store = new LocalStorageStore(failingStorage("getItem"));

    expect(() => store.getItem("key")).toThrowError(
      expect.objectContaining({ kind: "local-read-failed" }),
    );
  });
});
