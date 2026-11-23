import { describe, expect, it } from "vitest";
import { PersistenceError } from "./persistenceError";
import { createPersistenceService } from "./persistenceService";
import { createHttpRecordStore } from "./httpRecordStore";

const noLocalValue = { read: () => null, write: () => undefined };

function serviceWithFetch(fetch: () => Promise<Response>, baseUrl: string | null = "http://backend.example.com") {
  return createPersistenceService({ local: noLocalValue, remote: createHttpRecordStore({ fetch, baseUrl }) });
}

describe("load when the key is missing locally and the backend cannot answer", () => {
  it("resolves the fallback with a sync-failed error when the backend is down", async () => {
    const service = serviceWithFetch(() => Promise.reject(new TypeError("offline")));
    const result = await service.load("score", 5);
    expect(result).toMatchObject({ ok: false, value: 5, error: { kind: "sync-failed" } });
  });

  it("resolves the fallback with a sync-unconfigured error when no base URL is set", async () => {
    const service = serviceWithFetch(() => Promise.reject(new Error("unused")), null);
    const result = await service.load("score", 5);
    expect(result).toMatchObject({ ok: false, value: 5, error: { kind: "sync-unconfigured" } });
  });

  it("resolves the fallback with a sync-failed error when the backend answers non-2xx", async () => {
    const service = serviceWithFetch(async () => new Response("boom", { status: 500 }));
    const result = await service.load("score");
    expect(result).toMatchObject({ ok: false, value: null, error: { kind: "sync-failed" } });
  });

  it("resolves an invalid-key error for a key the backend would refuse", async () => {
    const service = serviceWithFetch(async () => new Response("{}", { status: 200 }));
    const result = await service.load("games/1", "fallback");
    expect(result).toMatchObject({ ok: false, value: "fallback", error: { kind: "invalid-key" } });
  });

  it("resolves the restored value with local-write-failed when it cannot be written back", async () => {
    const failingWrite = { read: () => null, write: () => { throw new PersistenceError("local-write-failed", "full"); } };
    const remote = { put: async () => ({}), get: async () => 9 };
    const result = await createPersistenceService({ local: failingWrite, remote }).load("score");
    expect(result).toMatchObject({ ok: false, value: 9, error: { kind: "local-write-failed" } });
  });
});

describe("load result shape", () => {
  it("resolves ok:true with the fallback when the backend has no record", async () => {
    const service = serviceWithFetch(async () => new Response("{}", { status: 404 }));
    expect(await service.load("score", 5)).toEqual({ ok: true, value: 5 });
  });

  it("resolves a stored value shaped like a failure as ok:true data", async () => {
    const lookalike = { ok: false, value: 1, error: "not a failure" };
    const local = { read: () => lookalike, write: () => undefined };
    const remote = { put: async () => ({}), get: async () => null };
    expect(await createPersistenceService({ local, remote }).load("k")).toEqual({ ok: true, value: lookalike });
  });

  it("resolves local-read-failed for unreadable local data and never rejects", async () => {
    const unreadable = { read: () => { throw new PersistenceError("local-read-failed", "bad"); }, write: () => undefined };
    const remote = { put: async () => ({}), get: async () => 1 };
    const result = await createPersistenceService({ local: unreadable, remote }).load("k", 2);
    expect(result).toMatchObject({ ok: false, value: 2, error: { kind: "local-read-failed" } });
  });
});
