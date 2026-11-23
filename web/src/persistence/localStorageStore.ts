import { PersistenceError } from "./persistenceError";
import type { LocalStore } from "./ports";

function parseStored(key: string, raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new PersistenceError("local-read-failed", `Stored value for "${key}" is not valid JSON`, false, error);
  }
}

function serialise(key: string, value: unknown): string {
  const serialised = JSON.stringify(value);
  if (serialised === undefined) {
    throw new PersistenceError("local-write-failed", `Value for "${key}" cannot be stored as JSON`);
  }
  return serialised;
}

export function createLocalStorageStore(storage: Storage): LocalStore {
  function read(key: string): unknown | null {
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch (error) {
      throw new PersistenceError("local-read-failed", `Could not read "${key}" from localStorage`, false, error);
    }
    return raw === null ? null : parseStored(key, raw);
  }

  function write(key: string, value: unknown): void {
    const serialised = serialise(key, value);
    try {
      storage.setItem(key, serialised);
    } catch (error) {
      throw new PersistenceError("local-write-failed", `Could not write "${key}" to localStorage`, false, error);
    }
  }

  return { read, write };
}
