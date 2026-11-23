export type PersistenceErrorKind =
  | "local-read-failed"
  | "local-write-failed"
  | "sync-failed"
  | "sync-unconfigured";

export class PersistenceError extends Error {
  readonly kind: PersistenceErrorKind;
  readonly localValueKept: boolean;

  constructor(kind: PersistenceErrorKind, message: string, localValueKept = false) {
    super(message);
    this.name = "PersistenceError";
    this.kind = kind;
    this.localValueKept = localValueKept;
  }
}
