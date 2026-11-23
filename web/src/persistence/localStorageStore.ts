import { PersistenceError } from "./persistenceError";
import type { LocalStore } from "./ports";

export function createLocalStorageStore(storage: Pick<Storage, "getItem" | "setItem">): LocalStore {
  return {
    read(key) {
      const raw = readRaw(storage, key);
      return raw === null ? null : parseStored(key, raw);
    },
    write(key, value) {
      try {
        storage.setItem(key, JSON.stringify(value));
      } catch {
        throw new PersistenceError("local-write-failed", `Could not save "${key}" to localStorage.`);
      }
    },
  };
}

function readRaw(storage: Pick<Storage, "getItem">, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    throw new PersistenceError("local-read-failed", `Could not read "${key}" from localStorage.`);
  }
}

function parseStored(key: string, raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new PersistenceError("local-read-failed", `The stored value for "${key}" is not valid JSON.`);
  }
}
