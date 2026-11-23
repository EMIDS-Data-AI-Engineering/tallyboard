import { beforeEach, describe, expect, it, vi } from "vitest";

const SAVED_AT = "2026-01-01T00:00:00.000Z";
const PLAYER_KEY = "player-profile";
const PLAYER_VALUE = { name: "Test Player", level: 3 };

function acknowledgingRemote() {
  return {
    push: vi.fn(async (key: string, record: { savedAt: string }) => ({
      key,
      savedAt: record.savedAt,
      acknowledged: true as const,
    })),
    fetch: vi.fn(async () => null as { value: unknown; savedAt: string } | null),
  };
}

function browserLocalStore() {
  return {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
  };
}

async function buildService(remote = acknowledgingRemote(), local: unknown = browserLocalStore()) {
  const { PersistenceService } = await import("./persistenceService");
  return new PersistenceService(local as never, remote as never);
}

function throwingLocalStore(failOn: "getItem" | "setItem") {
  return {
    ...browserLocalStore(),
    [failOn]: () => {
      throw new Error("storage unavailable");
    },
  };
}

describe("PersistenceService", () => {
  beforeEach(() => window.localStorage.clear());

  describe("AC1 local persistence and precedence", () => {
    it("a value saved by one service instance is read back by a fresh instance over the same localStorage", async () => {
      await (await buildService()).save(PLAYER_KEY, PLAYER_VALUE);

      const reopened = await buildService();

      expect(reopened.load(PLAYER_KEY)).toMatchObject({ ok: true, value: PLAYER_VALUE });
    });

    it("restore returns the local value and ignores a differing backend copy", async () => {
      const remote = acknowledgingRemote();
      remote.fetch.mockResolvedValue({ value: { name: "Backend" }, savedAt: SAVED_AT });
      const service = await buildService(remote);
      await service.save(PLAYER_KEY, PLAYER_VALUE);

      const restored = await service.restore(PLAYER_KEY);

      expect(restored.value).toEqual(PLAYER_VALUE);
    });

    it("restore never overwrites local data with the backend copy", async () => {
      const remote = acknowledgingRemote();
      remote.fetch.mockResolvedValue({ value: { name: "Backend" }, savedAt: SAVED_AT });
      const service = await buildService(remote);
      await service.save(PLAYER_KEY, PLAYER_VALUE);

      await service.restore(PLAYER_KEY);

      expect(JSON.parse(window.localStorage.getItem(PLAYER_KEY) as string)).toEqual(PLAYER_VALUE);
      expect(remote.fetch).not.toHaveBeenCalled();
    });

    it("restore repopulates localStorage from the backend when the local entry is absent", async () => {
      const remote = acknowledgingRemote();
      remote.fetch.mockResolvedValue({ value: PLAYER_VALUE, savedAt: SAVED_AT });
      const service = await buildService(remote);

      const restored = await service.restore(PLAYER_KEY);

      expect(restored.value).toEqual(PLAYER_VALUE);
      expect(JSON.parse(window.localStorage.getItem(PLAYER_KEY) as string)).toEqual(PLAYER_VALUE);
    });

    it("restore falls back to the default when neither store has the key", async () => {
      const service = await buildService();

      const restored = await service.restore(PLAYER_KEY, "fallback");

      expect(restored.value).toBe("fallback");
    });

    it("restore reports sync-failed and returns the fallback when the backend fetch rejects", async () => {
      const remote = acknowledgingRemote();
      remote.fetch.mockRejectedValue(new Error("offline"));
      const service = await buildService(remote);

      const restored = await service.restore(PLAYER_KEY, "fallback");

      expect(restored).toMatchObject({ value: "fallback", error: { kind: "sync-failed" } });
    });
  });

  describe("AC2 backend sync", () => {
    it("a successful local save pushes the same value and reports it acknowledged", async () => {
      const remote = acknowledgingRemote();
      const service = await buildService(remote);

      const outcome = await service.save(PLAYER_KEY, PLAYER_VALUE);

      expect(remote.push).toHaveBeenCalledWith(
        PLAYER_KEY,
        expect.objectContaining({ value: PLAYER_VALUE, savedAt: expect.any(String) }),
      );
      expect(outcome).toMatchObject({ local: { status: "saved" }, sync: { status: "acknowledged" } });
    });
  });

  describe("AC3 null-safe reads", () => {
    it("load of a missing key returns null by default without throwing", async () => {
      const service = await buildService();

      expect(service.load("missing")).toMatchObject({ ok: true, value: null });
    });

    it("load of a missing key returns the caller-supplied fallback", async () => {
      const service = await buildService();

      expect(service.load("missing", { score: 0 })).toMatchObject({ ok: true, value: { score: 0 } });
    });

    it("load of a corrupt entry returns the fallback and reports a corrupt-entry error", async () => {
      window.localStorage.setItem(PLAYER_KEY, "{not json");
      const service = await buildService();

      expect(service.load(PLAYER_KEY, "fallback")).toMatchObject({
        ok: false,
        value: "fallback",
        error: { kind: "corrupt-entry" },
      });
    });

    it("load from an unreadable store returns the fallback and reports local-read-failed", async () => {
      const service = await buildService(acknowledgingRemote(), throwingLocalStore("getItem"));

      expect(service.load(PLAYER_KEY, "fallback")).toMatchObject({
        ok: false,
        value: "fallback",
        error: { kind: "local-read-failed" },
      });
    });
  });

  describe("AC4 graceful errors", () => {
    it("a throwing localStorage write is reported as local-write-failed and is not synced", async () => {
      const remote = acknowledgingRemote();
      const service = await buildService(remote, throwingLocalStore("setItem"));

      const outcome = await service.save(PLAYER_KEY, PLAYER_VALUE);

      expect(outcome.local).toMatchObject({ status: "failed", error: { kind: "local-write-failed" } });
      expect(outcome.sync.status).toBe("not-attempted");
      expect(remote.push).not.toHaveBeenCalled();
    });

    it("a rejected sync keeps the local value and reports sync-failed", async () => {
      const remote = acknowledgingRemote();
      remote.push.mockRejectedValue(new Error("backend down"));
      const service = await buildService(remote);

      const outcome = await service.save(PLAYER_KEY, PLAYER_VALUE);

      expect(outcome.sync).toMatchObject({ status: "failed", error: { kind: "sync-failed" } });
      expect(service.load(PLAYER_KEY).value).toEqual(PLAYER_VALUE);
    });
  });
});
