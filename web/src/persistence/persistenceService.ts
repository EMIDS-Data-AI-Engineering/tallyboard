import { PersistenceError } from "./persistenceError";
import type { LocalStore, RemoteRecordStore } from "./ports";

export interface PersistenceServiceDependencies {
  local: LocalStore;
  remote: RemoteRecordStore;
}

export interface PersistenceService {
  save(key: string, value: unknown): Promise<void>;
  load<T = unknown>(key: string, fallback?: T | null): Promise<T | null>;
}

export function createPersistenceService({ local, remote }: PersistenceServiceDependencies): PersistenceService {
  async function syncToBackend(key: string, value: unknown): Promise<void> {
    try {
      await remote.put(key, value);
    } catch (error) {
      throw asSyncFailure(error);
    }
  }

  async function fetchFromBackend(key: string): Promise<unknown | null> {
    try {
      return await remote.get(key);
    } catch (error) {
      throw asBackendReadFailure(error);
    }
  }

  async function restoreFromBackend(key: string): Promise<unknown | null> {
    const restored = await fetchFromBackend(key);
    if (restored !== null) local.write(key, restored);
    return restored;
  }

  return {
    async save(key, value) {
      assertKeyAcceptedByBackend(key);
      local.write(key, value);
      await syncToBackend(key, value);
    },

    async load<T>(key: string, fallback: T | null = null): Promise<T | null> {
      const localValue = local.read(key);
      const value = localValue !== null ? localValue : await restoreFromBackend(key);
      return value !== null ? (value as T) : fallback;
    },
  };
}

const BACKEND_KEY_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

function assertKeyAcceptedByBackend(key: string): void {
  if (!BACKEND_KEY_PATTERN.test(key)) {
    throw new PersistenceError("invalid-key", "Keys must be 1-128 characters from A-Z a-z 0-9 . _ : -");
  }
}

function asSyncFailure(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) {
    return new PersistenceError(error.kind, error.message, true);
  }
  return new PersistenceError("sync-failed", "Saved locally, but syncing to the backend failed.", true);
}

function asBackendReadFailure(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) return error;
  return new PersistenceError("sync-failed", "Could not read the key from the backend.", false);
}
