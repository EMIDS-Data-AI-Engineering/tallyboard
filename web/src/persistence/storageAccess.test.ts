import { describe, expect, it } from "vitest";
import { createLocalStorageStore } from "./localStorageStore";
import { createPersistenceService } from "./persistenceService";

function throwingStorage(failing: "getItem" | "setItem") {
  const securityError = new DOMException("blocked", "SecurityError");
  return {
    getItem: (): string | null => {
      if (failing === "getItem") throw securityError;
      return null;
    },
    setItem: (): void => {
      if (failing === "setItem") throw securityError;
    },
  };
}

describe("localStorage access failures", () => {
  it("a throwing getItem becomes a typed local-read-failed error", () => {
    const store = createLocalStorageStore(throwingStorage("getItem"));
    expect(() => store.read("score")).toThrowError(expect.objectContaining({ kind: "local-read-failed" }));
  });

  it("a throwing setItem stays local-write-failed", () => {
    const store = createLocalStorageStore(throwingStorage("setItem"));
    expect(() => store.write("score", 1)).toThrowError(expect.objectContaining({ kind: "local-write-failed" }));
  });

  it("the service surfaces local-read-failed from load", async () => {
    const local = createLocalStorageStore(throwingStorage("getItem"));
    const service = createPersistenceService({ local, remote: { put: async () => ({}), get: async () => null } });
    await expect(service.load("score")).rejects.toMatchObject({ kind: "local-read-failed" });
  });
});
