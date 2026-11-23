export interface LocalStore {
  /** Returns the stored value, or null when the key is absent. */
  read(key: string): unknown | null;
  write(key: string, value: unknown): void;
}

export interface RemoteRecordStore {
  put(key: string, value: unknown): Promise<unknown>;
  /** Resolves to null when the backend holds no record for the key. */
  get(key: string): Promise<unknown | null>;
}
