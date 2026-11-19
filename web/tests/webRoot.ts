import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const webConfigFile = resolve(webRoot, "vite.config.ts");
