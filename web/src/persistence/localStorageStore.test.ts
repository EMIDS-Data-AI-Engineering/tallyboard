// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

const storeModule = "./localStorageStore";

async function buildStore(storage: Storage) {
  const { createLocalStorageStore } = await import(/* @vite-ignore */ storeModule);
  return createLocalStorageStore(storage);
}

beforeEach(() => window.localStorage.clear());

describe("localStorageStore", () => {
  it("round-trips a JSON value through window.localStorage", async () => {
    const store = await buildStore(window.localStorage);

    store.write("profile", { id: "p-1", tags: ["a", "b"] });

    expect(store.read("profile")).toEqual({ id: "p-1", tags: ["a", "b"] });
    expect(window.localStorage.getItem("profile")).toBe('{"id":"p-1","tags":["a","b"]}');
  });

  it("reads a missing key as null", async () => {
    const store = await buildStore(window.localStorage);

    expect(store.read("absent")).toBeNull();
  });

  it("QuotaExceededError becomes a typed local-write-failed error", async () => {
    const full = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    } as unknown as Storage;
    const store = await buildStore(full);

    let thrown: { kind?: string } | undefined;
    try {
      store.write("k", 1);
    } catch (error) {
      thrown = error as { kind?: string };
    }

    expect(thrown?.kind).toBe("local-write-failed");
  });
});
