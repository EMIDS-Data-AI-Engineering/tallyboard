import { describe, expect, it } from "vitest";
import { webConfigFile, webRoot } from "./webRoot";

async function withDevServer(check: (baseUrl: string) => Promise<void>) {
  const { createServer } = await import("vite");
  const server = await createServer({
    root: webRoot,
    configFile: webConfigFile,
    logLevel: "silent",
    server: { port: 0, host: "127.0.0.1" },
  });
  try {
    await server.listen();
    await check(server.resolvedUrls!.local[0]);
  } finally {
    await server.close();
  }
}

describe("Vite dev server", () => {
  it("starts the Vite dev server and serves the app shell with #root", async () => {
    await withDevServer(async (baseUrl) => {
      const response = await fetch(baseUrl);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('id="root"');
    });
  });

  it("transforms src/main.tsx without errors", async () => {
    await withDevServer(async (baseUrl) => {
      const response = await fetch(new URL("src/main.tsx", baseUrl));

      expect(response.status).toBe(200);
      expect(await response.text()).toContain("findRootElement");
    });
  });
});
