import { PersistenceError } from "./persistenceError";
import type { LocalStore, RemoteRecordStore } from "./ports";

export interface PersistenceServiceDependencies {
  local: LocalStore;
  remote: RemoteRecordStore;
}

/** What load resolves on every path: it never rejects and never returns a bare value.
 *  `value` is the stored value, the restored value, or the caller's fallback when `ok` is false or the key is absent. */
export type LoadResult<T> =
  | { ok: true; value: T | null }
  | { ok: false; value: T | null; error: PersistenceError };

export interface PersistenceService {
  save(key: string, value: unknown): Promise<void>;
  load<T = unknown>(key: string, fallback?: T | null): Promise<LoadResult<T>>;
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

  function writeBack<T>(key: string, restored: T): LoadResult<T> {
    try {
      local.write(key, restored);
      return success(restored);
    } catch (error) {
      return failure(restored, asLocalWriteFailure(error));
    }
  }

  async function restoreFromBackend<T>(key: string, fallback: T | null): Promise<LoadResult<T>> {
    try {
      const restored = await fetchFromBackend(key);
      return restored === null ? success(fallback) : writeBack(key, restored as T);
    } catch (error) {
      return failure(fallback, error as PersistenceError);
    }
  }

  async function loadKey<T>(key: string, fallback: T | null): Promise<LoadResult<T>> {
    assertKeyAcceptedByBackend(key);
    const localValue = readLocally(key);
    return localValue !== null ? success(localValue as T) : restoreFromBackend(key, fallback);
  }

  function readLocally(key: string): unknown | null {
    try {
      return local.read(key);
    } catch (error) {
      throw asLocalReadFailure(error);
    }
  }

  return {
    async save(key, value) {
      assertKeyAcceptedByBackend(key);
      assertValueIsStorable(value);
      local.write(key, value);
      await syncToBackend(key, value);
    },

    async load<T>(key: string, fallback: T | null = null): Promise<LoadResult<T>> {
      try {
        return await loadKey(key, fallback);
      } catch (error) {
        return failure(fallback, error as PersistenceError);
      }
    },
  };
}

const BACKEND_KEY_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

function assertKeyAcceptedByBackend(key: string): void {
  if (!BACKEND_KEY_PATTERN.test(key)) {
    throw new PersistenceError("invalid-key", "Keys must be 1-128 characters from A-Z a-z 0-9 . _ : -");
  }
}

function assertValueIsStorable(value: unknown): void {
  if (value === undefined || value === null) {
    throw new PersistenceError("invalid-value", "undefined and null cannot be stored: null means a key is absent.");
  }
}

function success<T>(value: T | null): LoadResult<T> {
  return { ok: true, value };
}

function failure<T>(value: T | null, error: PersistenceError): LoadResult<T> {
  return { ok: false, value, error };
}

function asLocalReadFailure(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) return error;
  return new PersistenceError("local-read-failed", "Could not read the key from localStorage.", false);
}

function asLocalWriteFailure(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) return error;
  return new PersistenceError("local-write-failed", "Could not write the key to localStorage.", false);
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
