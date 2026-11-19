import react from "@vitejs/plugin-react";
import { optimizeDeps, type Plugin } from "vite";
import { defineConfig } from "vitest/config";

// Template literals keep their literal newlines when minified; lowering them
// to escaped strings yields a bundle without indented continuation lines.
const lowerTemplateLiterals = { supported: { "template-literal": false } };

// Closing a dev server while its dependency pre-bundling is still running never
// settles, so finish pre-bundling before the server is handed to the caller.
const prebundleDependenciesFirst: Plugin = {
  name: "prebundle-dependencies-first",
  apply: "serve",
  async configureServer(server) {
    await optimizeDeps(server.config);
  },
};

export default defineConfig(({ command }) => ({
  plugins: [react(), prebundleDependenciesFirst],
  esbuild: command === "build" ? lowerTemplateLiterals : {},
  test: {
    coverage: { include: ["src/**"], exclude: ["src/main.tsx", "src/test/**", "src/types/**", "src/**/*.test.*"] },
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
    testTimeout: 60_000,
  },
}));
