import { describe, expect, it } from "vitest";

const storeModule = "./httpRecordStore";
const baseUrl = "http://api.example.test";

type Call = { url: string; init?: RequestInit };

function respondingWith(status: number, body: unknown) {
  const calls: Call[] = [];
  const fetchStub = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  };
  return { fetchStub, calls };
}

async function buildStore(fetchStub: unknown, url: string | undefined = baseUrl) {
  const { createHttpRecordStore } = await import(/* @vite-ignore */ storeModule);
  return createHttpRecordStore({ fetch: fetchStub, baseUrl: url });
}

describe("httpRecordStore", () => {
  it("PUTs the value to /v1/records/{key} and resolves with the acknowledgement", async () => {
    const acknowledgement = { key: "player", stored_at: "2026-01-01T00:00:00Z" };
    const { fetchStub, calls } = respondingWith(200, acknowledgement);
    const store = await buildStore(fetchStub);

    const result = await store.put("player", { name: "Jane Doe" });

    expect(result).toEqual(acknowledgement);
    expect(calls[0].url).toBe(`${baseUrl}/v1/records/player`);
    expect(calls[0].init?.method).toBe("PUT");
    expect(JSON.parse(calls[0].init?.body as string)).toEqual({ value: { name: "Jane Doe" } });
  });

  it("GETs the stored value", async () => {
    const { fetchStub, calls } = respondingWith(200, { key: "k", value: [1], stored_at: "2026-01-01T00:00:00Z" });
    const store = await buildStore(fetchStub);

    expect(await store.get("k")).toEqual([1]);
    expect(calls[0].url).toBe(`${baseUrl}/v1/records/k`);
  });

  it("a 404 resolves to null instead of throwing", async () => {
    const store = await buildStore(respondingWith(404, { detail: "not found" }).fetchStub);

    expect(await store.get("missing")).toBeNull();
  });

  it("a non-2xx response rejects with sync-failed", async () => {
    const store = await buildStore(respondingWith(500, { detail: "boom" }).fetchStub);

    await expect(store.put("k", 1)).rejects.toMatchObject({ kind: "sync-failed" });
  });

  it("a network failure rejects with sync-failed", async () => {
    const store = await buildStore(async () => {
      throw new TypeError("network down");
    });

    await expect(store.put("k", 1)).rejects.toMatchObject({ kind: "sync-failed" });
  });

  it("a missing base URL throws sync-unconfigured", async () => {
    const useUnconfiguredStore = async () => {
      const store = await buildStore(respondingWith(200, {}).fetchStub, undefined);
      return store.put("k", 1);
    };

    await expect(useUnconfiguredStore()).rejects.toMatchObject({ kind: "sync-unconfigured" });
  });
});
