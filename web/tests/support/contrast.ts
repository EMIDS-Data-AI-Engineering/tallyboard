function expandHex(hex: string): string {
  const digits = hex.replace("#", "");
  return digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits;
}

function linearChannel(channel: number): number {
  const scaled = channel / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const digits = expandHex(hex);
  const [red, green, blue] = [0, 2, 4].map((start) => linearChannel(parseInt(digits.slice(start, start + 2), 16)));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
