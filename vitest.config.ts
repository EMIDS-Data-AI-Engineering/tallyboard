import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["web/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
    environment: "happy-dom",
    setupFiles: ["web/src/test/setup.ts"],
    testTimeout: 60_000,
  },
});
