import { PersistenceError } from "./persistenceError";
import type { LocalStore, RemoteRecordStore } from "./ports";

export interface PersistenceServiceDependencies {
  local: LocalStore;
  remote: RemoteRecordStore;
}

/** What load always resolves: check `ok` before using `value`. On failure `value` is the caller's fallback,
 *  or the backend value that was restored but could not be written back to localStorage. */
export type LoadResult<T> = { ok: true; value: T | null } | LoadFailure<T>;

export interface LoadFailure<T> {
  ok: false;
  value: T | null;
  error: PersistenceError;
}

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

  async function restoreFromBackend<T>(key: string, fallback: T | null): Promise<LoadResult<T>> {
    let restored: unknown | null;
    try {
      restored = await fetchFromBackend(key);
    } catch (error) {
      return failure(fallback, error as PersistenceError);
    }
    if (restored === null) return success(fallback);
    try {
      local.write(key, restored);
    } catch (error) {
      return failure(restored as T, asPersistenceError(error));
    }
    return success(restored as T);
  }

  async function loadFromLocalOrBackend<T>(key: string, fallback: T | null): Promise<LoadResult<T>> {
    assertKeyAcceptedByBackend(key);
    const localValue = local.read(key);
    return localValue !== null ? success(localValue as T) : restoreFromBackend(key, fallback);
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
        return await loadFromLocalOrBackend(key, fallback);
      } catch (error) {
        return failure(fallback, asPersistenceError(error));
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
    throw new PersistenceError("invalid-value", "undefined and null cannot be stored; null is the value load reports for a missing key.");
  }
}

function success<T>(value: T | null): LoadResult<T> {
  return { ok: true, value };
}

function failure<T>(value: T | null, error: PersistenceError): LoadFailure<T> {
  return { ok: false, value, error };
}

function asPersistenceError(error: unknown): PersistenceError {
  if (error instanceof PersistenceError) return error;
  return new PersistenceError("local-read-failed", "Could not read the key.", false);
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
