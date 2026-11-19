import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

const COVERAGE_FLOOR_PERCENT = 80;
const APP_ENTRY = "/src/main.tsx";

/**
 * Finishes dependency pre-bundling before `listen()` resolves, so the server is
 * fully ready when it reports it is listening and can be closed cleanly at any time.
 */
function readyBeforeListening(): Plugin {
  return {
    name: "ready-before-listening",
    apply: "serve",
    configureServer(server) {
      const listen = server.listen.bind(server);
      server.listen = async (...listenArguments) => {
        const listeningServer = await listen(...listenArguments);
        await server.transformRequest(APP_ENTRY);
        await server.waitForRequestsIdle(APP_ENTRY);
        return listeningServer;
      };
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), readyBeforeListening()],
  // Vitest sets NODE_ENV=test, which would otherwise leak React's development build into bundles.
  define: command === "build" ? { "process.env.NODE_ENV": JSON.stringify("production") } : {},
  // Keep multi-line template literals out of the bundle so minified output stays single-line.
  esbuild: { supported: { "template-literal": false } },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
    testTimeout: 60_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test/**", "src/types/**", "src/**/*.test.{ts,tsx}"],
      thresholds: {
        lines: COVERAGE_FLOOR_PERCENT,
        functions: COVERAGE_FLOOR_PERCENT,
        branches: COVERAGE_FLOOR_PERCENT,
        statements: COVERAGE_FLOOR_PERCENT,
      },
    },
  },
}));
