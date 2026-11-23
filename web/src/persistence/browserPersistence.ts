import { createHttpRecordStore } from "./httpRecordStore";
import { createLocalStorageStore } from "./localStorageStore";
import { createPersistenceService } from "./persistenceService";
import type { PersistenceService } from "./persistenceService";

export interface BrowserPersistenceEnvironment {
  VITE_SYNC_API_URL?: string;
}

/** Composition for the browser. Not wired into the app yet; the auto-save story (TAL-19) does that.
 *  A missing VITE_SYNC_API_URL is not hidden: every sync then fails with `sync-unconfigured`. */
export function createBrowserPersistence(
  environment: BrowserPersistenceEnvironment = import.meta.env as BrowserPersistenceEnvironment,
  storage: Storage = window.localStorage,
): PersistenceService {
  return createPersistenceService({
    local: createLocalStorageStore(storage),
    remote: createHttpRecordStore({
      fetch: (url, init) => window.fetch(url, init),
      baseUrl: environment.VITE_SYNC_API_URL,
    }),
  });
}
