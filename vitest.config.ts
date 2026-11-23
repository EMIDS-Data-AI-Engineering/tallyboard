import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["web/src/test/setup.ts"],
    include: ["web/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
    testTimeout: 60_000,
  },
});
