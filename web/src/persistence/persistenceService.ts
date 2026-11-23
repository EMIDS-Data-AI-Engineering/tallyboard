import { PersistenceError } from "./persistenceError";
import type { LocalStore, RemoteRecordStore } from "./ports";

export interface PersistenceDependencies {
  local: LocalStore;
  remote: RemoteRecordStore;
}

function asSyncError(error: unknown, localValueKept: boolean): PersistenceError {
  if (error instanceof PersistenceError) {
    return new PersistenceError(error.kind, error.message, localValueKept, error);
  }
  return new PersistenceError("sync-failed", "Syncing to the backend failed", localValueKept, error);
}

export function createPersistenceService({ local, remote }: PersistenceDependencies) {
  async function syncToRemote(key: string, value: unknown): Promise<void> {
    try {
      await remote.put(key, value);
    } catch (error) {
      throw asSyncError(error, true);
    }
  }

  async function fetchFromRemote(key: string): Promise<unknown | null> {
    try {
      return await remote.get(key);
    } catch (error) {
      throw asSyncError(error, false);
    }
  }

  async function save(key: string, value: unknown): Promise<void> {
    local.write(key, value);
    await syncToRemote(key, value);
  }

  async function load<T = unknown>(key: string, fallback: T | null = null): Promise<T | null> {
    const localValue = local.read(key);
    if (localValue !== null) return localValue as T;
    const remoteValue = await fetchFromRemote(key);
    if (remoteValue === null) return fallback;
    local.write(key, remoteValue);
    return remoteValue as T;
  }

  return { save, load };
}

export type PersistenceService = ReturnType<typeof createPersistenceService>;
