export interface LocalStore {
  /** Returns the stored value, or null when the key is absent. Throws PersistenceError on unreadable data. */
  read(key: string): unknown | null;
  /** Throws PersistenceError("local-write-failed") when the value cannot be stored. */
  write(key: string, value: unknown): void;
}

export interface RecordAcknowledgement {
  key: string;
  stored_at: string;
}

export interface RemoteRecordStore {
  put(key: string, value: unknown): Promise<RecordAcknowledgement | unknown>;
  /** Resolves null when the backend holds no record for the key. */
  get(key: string): Promise<unknown | null>;
}
