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
  if (!existsSync(venvPython)) {
    console.error("api/.venv is missing. Run `npm run setup:api` once (needs network), then `npm test`.");
    return 1;
  }
  return run(venvPython, ["-m", "pytest", apiDir, "--cov=tallyboard_api", "--cov-report=term-missing"]);
}

const webStatus = runWebSuite();
const apiStatus = runApiSuite();
process.exit(webStatus !== 0 || apiStatus !== 0 ? 1 : 0);
