import { PersistenceError } from "./persistenceError";
import type { RemoteRecordStore } from "./ports";

const HTTP_NOT_FOUND = 404;

export interface HttpRecordStoreOptions {
  fetch: typeof fetch;
  baseUrl: string | undefined;
}

export function createHttpRecordStore({ fetch: fetchImpl, baseUrl }: HttpRecordStoreOptions): RemoteRecordStore {
  async function request(method: string, key: string, body?: unknown): Promise<Response> {
    if (!baseUrl) {
      throw new PersistenceError("sync-unconfigured", "The backend base URL is not configured");
    }
    const init: RequestInit = { method };
    if (body !== undefined) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(body);
    }
    try {
      return await fetchImpl(`${baseUrl}/v1/records/${encodeURIComponent(key)}`, init);
    } catch (error) {
      throw new PersistenceError("sync-failed", "The backend could not be reached", false, error);
    }
  }

  function requireOk(response: Response): Response {
    if (!response.ok) {
      throw new PersistenceError("sync-failed", `The backend answered with status ${response.status}`);
    }
    return response;
  }

  async function put(key: string, value: unknown): Promise<unknown> {
    const response = requireOk(await request("PUT", key, { value }));
    return response.json();
  }

  async function get(key: string): Promise<unknown | null> {
    const response = await request("GET", key);
    if (response.status === HTTP_NOT_FOUND) return null;
    const record = (await requireOk(response).json()) as { value: unknown };
    return record.value;
  }

  return { put, get };
}
