import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
export const apiDir = "api";
const venvDir = join(apiDir, ".venv");
const manifestFile = join(apiDir, "pyproject.toml");
const installStampFile = join(venvDir, ".pyproject-hash");
export const venvPython = join(venvDir, isWindows ? "Scripts" : "bin", isWindows ? "python.exe" : "python");

export function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: isWindows });
  return result.status ?? 1;
}

function manifestHash() {
  return createHash("sha256").update(readFileSync(manifestFile)).digest("hex");
}

function installIsCurrent() {
  return existsSync(installStampFile) && readFileSync(installStampFile, "utf8") === manifestHash();
}

function createVenvIfMissing() {
  if (existsSync(venvPython)) return 0;
  return run(isWindows ? "python" : "python3", ["-m", "venv", venvDir]);
}

function installApi() {
  const status = run(venvPython, ["-m", "pip", "install", "--quiet", "-e", `${apiDir}[dev]`]);
  if (status === 0) writeFileSync(installStampFile, manifestHash());
  return status;
}

/** Needs network only when the venv is missing or api/pyproject.toml changed since the last install. */
export function ensureApiEnvironment() {
  const venvStatus = createVenvIfMissing();
  if (venvStatus !== 0) return venvStatus;
  return installIsCurrent() ? 0 : installApi();
}
