import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
export const apiDir = "api";
const venvDir = join(apiDir, ".venv");
export const venvPython = join(venvDir, isWindows ? "Scripts" : "bin", isWindows ? "python.exe" : "python");

export function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: isWindows });
  return result.status ?? 1;
}

function createVenvIfMissing() {
  if (existsSync(venvPython)) return 0;
  return run(isWindows ? "python" : "python3", ["-m", "venv", venvDir]);
}

function installApi() {
  return run(venvPython, ["-m", "pip", "install", "--quiet", "-e", `${apiDir}[dev]`]);
}

export function ensureApiEnvironment() {
  return createVenvIfMissing() || installApi();
}
