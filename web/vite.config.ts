import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Keep multi-line template literals from dependencies as escaped strings so output stays single-line.
  esbuild: { supported: { "template-literal": false } },
  optimizeDeps: {
    // Pre-bundle the CommonJS React packages explicitly, skipping the crawl that a quickly closed server cancels.
    noDiscovery: true,
    include: ["react", "react/jsx-dev-runtime", "react-dom/client"],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
    testTimeout: 60_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/gallery.tsx", "src/test/**", "src/types/**", "src/**/*.test.*"],
    },
  },
});
