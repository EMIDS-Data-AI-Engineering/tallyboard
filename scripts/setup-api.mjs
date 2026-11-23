import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
const venvDir = join("api", ".venv");
const venvPython = join(venvDir, isWindows ? "Scripts" : "bin", isWindows ? "python.exe" : "python");

function run(command, args) {
  return spawnSync(command, args, { stdio: "inherit", shell: isWindows }).status ?? 1;
}

function createVenvIfMissing() {
  if (existsSync(venvPython)) return 0;
  return run(isWindows ? "python" : "python3", ["-m", "venv", venvDir]);
}

function installApi() {
  return run(venvPython, ["-m", "pip", "install", "--quiet", "-e", "api[dev]"]);
}

process.exit(createVenvIfMissing() || installApi());
