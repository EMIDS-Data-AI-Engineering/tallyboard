import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
const apiDir = "api";
const venvDir = join(apiDir, ".venv");
const venvPython = join(venvDir, isWindows ? "Scripts" : "bin", isWindows ? "python.exe" : "python");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: isWindows });
  return result.status ?? 1;
}

function runWebSuite() {
  return run("npx", ["vitest", "run"]);
}

function runApiSuite() {
  if (!existsSync(venvPython) && run(isWindows ? "python" : "python3", ["-m", "venv", venvDir]) !== 0) return 1;
  if (run(venvPython, ["-m", "pip", "install", "--quiet", "-e", `${apiDir}[dev]`]) !== 0) return 1;
  return run(venvPython, ["-m", "pytest", apiDir, "--cov=tallyboard_api", "--cov-report=term-missing"]);
}

const webStatus = runWebSuite();
const apiStatus = runApiSuite();
process.exit(webStatus !== 0 || apiStatus !== 0 ? 1 : 0);
