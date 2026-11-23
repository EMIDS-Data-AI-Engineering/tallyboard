import { apiDir, ensureApiEnvironment, run, venvPython } from "./apiEnvironment.mjs";

function runWebSuite() {
  return run("npx", ["vitest", "run"]);
}

function runApiSuite() {
  return ensureApiEnvironment() || run(venvPython, ["-m", "pytest", apiDir, "--cov=tallyboard_api", "--cov-report=term-missing"]);
}

const webStatus = runWebSuite();
const apiStatus = runApiSuite();
process.exit(webStatus !== 0 || apiStatus !== 0 ? 1 : 0);
