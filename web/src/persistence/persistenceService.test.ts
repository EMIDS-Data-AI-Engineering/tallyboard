// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

// Ports as the plan defines them: LocalStore {read, write}, RemoteRecordStore {put, get}.
const serviceModule = "./persistenceService";
const localStoreModule = "./localStorageStore";

type Remote = {
  put: (key: string, value: unknown) => Promise<unknown>;
  get: (key: string) => Promise<unknown | null>;
};

function fakeRemote(overrides: Partial<Remote> = {}) {
  const calls: Array<[string, string, unknown?]> = [];
  const remote: Remote = {
    put: async (key, value) => {
      calls.push(["put", key, value]);
      return { key };
    },
    get: async (key) => {
      calls.push(["get", key]);
      return null;
    },
    ...overrides,
  };
  return { remote, calls };
}

async function buildService(remote: Remote, storage: Storage = window.localStorage) {
  const { createPersistenceService } = await import(/* @vite-ignore */ serviceModule);
  const { createLocalStorageStore } = await import(/* @vite-ignore */ localStoreModule);
  return createPersistenceService({ local: createLocalStorageStore(storage), remote });
}

function quotaExceededStorage(): Storage {
  const storage = window.localStorage;
  return {
    getItem: (key: string) => storage.getItem(key),
    setItem: () => {
      throw new DOMException("full", "QuotaExceededError");
    },
  } as unknown as Storage;
}

async function rejectionOf(action: Promise<unknown>) {
  try {
    await action;
  } catch (error) {
    return error as { kind: string; localValueKept: boolean };
  }
  throw new Error("expected the promise to reject");
}

beforeEach(() => window.localStorage.clear());

describe("persistenceService", () => {
  it("a value saved by one service instance is read back by a fresh instance over the same storage", async () => {
    await (await buildService(fakeRemote().remote)).save("player", { name: "Jane Doe" });

    const reopened = await buildService(fakeRemote().remote);

    expect(await reopened.load("player")).toEqual({ ok: true, value: { name: "Jane Doe" } });
  });

  it("localStorage value wins over a differing backend copy and the backend is not consulted", async () => {
    window.localStorage.setItem("score", JSON.stringify(10));
    const { remote, calls } = fakeRemote({ get: async () => 99 });

    const service = await buildService(remote);

    expect(await service.load("score")).toEqual({ ok: true, value: 10 });
    expect(calls).toEqual([]);
  });

  it("a key missing locally is restored from the backend and written back to localStorage", async () => {
    const { remote } = fakeRemote({ get: async () => ({ wins: 3 }) });
    const service = await buildService(remote);

    expect(await service.load("stats")).toEqual({ ok: true, value: { wins: 3 } });
    expect(JSON.parse(window.localStorage.getItem("stats") as string)).toEqual({ wins: 3 });
  });

  it("save sends the same value to the remote store after the local write", async () => {
    const { remote, calls } = fakeRemote();
    const service = await buildService(remote);

    await service.save("board", [1, 2, 3]);

    expect(calls).toEqual([["put", "board", [1, 2, 3]]]);
    expect(JSON.parse(window.localStorage.getItem("board") as string)).toEqual([1, 2, 3]);
  });

  it("load returns null for a key absent locally and remotely", async () => {
    const service = await buildService(fakeRemote().remote);

    expect(await service.load("nothing")).toEqual({ ok: true, value: null });
  });

  it("load returns the caller-supplied fallback for a missing key", async () => {
    const service = await buildService(fakeRemote().remote);

    expect(await service.load("nothing", { empty: true })).toEqual({ ok: true, value: { empty: true } });
  });

  it("corrupt local JSON surfaces a typed error", async () => {
    window.localStorage.setItem("broken", "{not json");
    const service = await buildService(fakeRemote().remote);

    const result = await service.load("broken");

    expect(result).toMatchObject({ ok: false, error: { kind: "local-read-failed" } });
  });

  it("a failing local write rejects with local-write-failed and skips the sync", async () => {
    const { remote, calls } = fakeRemote();
    const service = await buildService(remote, quotaExceededStorage());

    const error = await rejectionOf(service.save("k", 1));

    expect(error.kind).toBe("local-write-failed");
    expect(calls).toEqual([]);
  });

  it("a failed sync rejects with sync-failed and keeps the local value", async () => {
    const { remote } = fakeRemote({
      put: async () => {
        throw new Error("offline");
      },
    });
    const service = await buildService(remote);

    const error = await rejectionOf(service.save("k", "kept"));

    expect(error.kind).toBe("sync-failed");
    expect(error.localValueKept).toBe(true);
    expect(JSON.parse(window.localStorage.getItem("k") as string)).toBe("kept");
  });
});
