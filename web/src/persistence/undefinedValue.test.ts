import { describe, expect, it, vi } from "vitest";
import { createPersistenceService } from "./persistenceService";

describe("save(key, undefined)", () => {
  it("is refused with invalid-value before any local write or sync", async () => {
    const local = { read: () => null, write: vi.fn() };
    const remote = { put: vi.fn(), get: vi.fn() };
    const service = createPersistenceService({ local, remote });

    await expect(service.save("score", undefined)).rejects.toMatchObject({ kind: "invalid-value" });
    expect(local.write).not.toHaveBeenCalled();
    expect(remote.put).not.toHaveBeenCalled();
  });
});
