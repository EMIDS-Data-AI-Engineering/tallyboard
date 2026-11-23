import { describe, expect, it, vi } from "vitest";

const BASE_URL = "https://sync.example.com";
const SAVED_AT = "2026-01-01T00:00:00.000Z";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function buildStore(fetchImpl: unknown) {
  const { HttpRecordStore } = await import("./httpRecordStore");
  return new HttpRecordStore({ baseUrl: BASE_URL, fetch: fetchImpl as typeof fetch });
}

describe("HttpRecordStore", () => {
  it("push sends PUT /v1/records/{key} with the contract body and accepts the acknowledgement", async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse(200, { key: "a b", savedAt: SAVED_AT, acknowledged: true }),
    );
    const store = await buildStore(fetchSpy);

    const acknowledgement = await store.push("a b", { value: { n: 1 }, savedAt: SAVED_AT });

    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${BASE_URL}/v1/records/a%20b`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({ value: { n: 1 }, savedAt: SAVED_AT });
    expect(acknowledgement).toMatchObject({ acknowledged: true });
  });

  it("a non-2xx response is reported as sync-failed with status", async () => {
    const store = await buildStore(async () => jsonResponse(503, {}));

    await expect(store.push("k", { value: 1, savedAt: SAVED_AT })).rejects.toMatchObject({
      kind: "sync-failed",
      status: 503,
    });
  });

  it("a network rejection is reported as sync-failed", async () => {
    const store = await buildStore(async () => {
      throw new TypeError("network down");
    });

    await expect(store.push("k", { value: 1, savedAt: SAVED_AT })).rejects.toMatchObject({
      kind: "sync-failed",
    });
  });

  it("fetch returns the stored record on 200", async () => {
    const store = await buildStore(async () =>
      jsonResponse(200, { key: "k", value: { n: 2 }, savedAt: SAVED_AT }),
    );

    expect(await store.fetch("k")).toEqual({ value: { n: 2 }, savedAt: SAVED_AT });
  });

  it("fetch returns null on 404", async () => {
    const store = await buildStore(async () => jsonResponse(404, {}));

    expect(await store.fetch("k")).toBeNull();
  });

  it("creating the store without a base URL throws", async () => {
    const { HttpRecordStore } = await import("./httpRecordStore");

    expect(() => new HttpRecordStore({ baseUrl: "", fetch: vi.fn() as never })).toThrow();
  });
});
