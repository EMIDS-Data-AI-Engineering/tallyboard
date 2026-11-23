import { PersistenceError } from "./persistenceError";
import type { RecordAcknowledgement, RemoteRecordStore } from "./ports";

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

export interface HttpRecordStoreOptions {
  fetch: FetchFunction;
  baseUrl: string | null | undefined;
}

const NOT_FOUND = 404;

export function createHttpRecordStore({ fetch, baseUrl }: HttpRecordStoreOptions): RemoteRecordStore {
  async function send(key: string, init?: RequestInit): Promise<Response> {
    if (!baseUrl) {
      throw new PersistenceError("sync-unconfigured", "No backend base URL is configured.");
    }
    try {
      return await fetch(`${baseUrl}/v1/records/${encodeURIComponent(key)}`, init);
    } catch {
      throw new PersistenceError("sync-failed", "The backend could not be reached.");
    }
  }

  return {
    async put(key, value): Promise<RecordAcknowledgement> {
      const response = await send(key, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      return requireOk(response).json();
    },

    async get(key) {
      const response = await send(key);
      if (response.status === NOT_FOUND) return null;
      return (await requireOk(response).json()).value;
    },
  };
}

function requireOk(response: Response): Response {
  if (!response.ok) {
    throw new PersistenceError("sync-failed", `The backend responded with status ${response.status}.`);
  }
  return response;
}
