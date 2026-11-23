export type ClassEntry = string | false | null | undefined;

export function joinClasses(...entries: ClassEntry[]): string {
  return entries.filter(Boolean).join(" ");
}
