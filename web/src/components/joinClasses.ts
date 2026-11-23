export function joinClasses(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}
