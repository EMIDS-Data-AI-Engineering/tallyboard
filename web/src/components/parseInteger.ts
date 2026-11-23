const INTEGER_PATTERN = /^-?\d+$/;

export function parseInteger(raw: string): number | null {
  if (!INTEGER_PATTERN.test(raw)) return null;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed)) return null;
  return parsed === 0 ? 0 : parsed;
}
