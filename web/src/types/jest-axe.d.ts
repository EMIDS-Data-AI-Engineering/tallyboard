declare module "jest-axe" {
  export function axe(container: Element): Promise<{ violations: unknown[] }>;
  export const toHaveNoViolations: {
    toHaveNoViolations(received: { violations: unknown[] }): { pass: boolean; message(): string };
  };
}
