import { describe, expect, it } from "vitest";
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
  it("load returns the fallback for a missing key when the backend fails", async () => {
    const service = createPersistenceService({ local: memoryLocal(), remote: failingRemote });
    expect(await service.load("fresh-key", "default")).toBe("default");
  });

  it("save rejects a key the backend would refuse, before writing locally", async () => {
    const local = memoryLocal();
    const service = createPersistenceService({ local, remote: failingRemote });
    await expect(service.save("games/1", 1)).rejects.toMatchObject({ kind: "invalid-key" });
    expect(local.read("games/1")).toBeNull();
  });
});
