import { describe, expect, it } from "vitest";
import { PersistenceError } from "./persistenceError";
import { createPersistenceService } from "./persistenceService";

const failingRemote = {
  put: async () => { throw new Error("down"); },
  get: async () => { throw new Error("down"); },
};

function memoryLocal() {
  const data = new Map<string, unknown>();
  return {
    read: (key: string) => data.get(key) ?? null,
    write: (key: string, value: unknown) => void data.set(key, value),
  };
}

describe("persistenceService offline and key handling", () => {
  it("load resolves the fallback with a sync-failed error when a missing key cannot be checked on the backend", async () => {
    const service = createPersistenceService({ local: memoryLocal(), remote: failingRemote });
    await expect(service.load("fresh-key", "default")).resolves.toMatchObject({ ok: false, value: "default", error: { kind: "sync-failed" } });
  });

  it("load still serves a local value while the backend is down", async () => {
    const local = memoryLocal();
    local.write("kept", 7);
    const service = createPersistenceService({ local, remote: failingRemote });
    expect(await service.load("kept")).toBe(7);
  });

  it("load resolves a failed write-back of the restored value as a typed error", async () => {
    const local = { read: () => null, write: () => { throw new PersistenceError("local-write-failed", "full", false); } };
    const remote = { put: async () => ({}), get: async () => 1 } as never;
    const service = createPersistenceService({ local, remote });
    await expect(service.load("k")).resolves.toMatchObject({ ok: false, error: { kind: "local-write-failed" } });
  });

  it("save rejects a key the backend would refuse, before writing locally", async () => {
    const local = memoryLocal();
    const service = createPersistenceService({ local, remote: failingRemote });
    await expect(service.save("games/1", 1)).rejects.toMatchObject({ kind: "invalid-key" });
    expect(local.read("games/1")).toBeNull();
  });
});
