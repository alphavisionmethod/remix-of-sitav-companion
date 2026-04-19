// SITA OS — Mobile bootstrap contract validator
// Asserts both bootstrap scripts exist, are executable shape, and reference
// the canonical Capacitor commands. Top-level enforcement that ties together
// android + ios native generation under one umbrella gate.
import { existsSync, readFileSync, statSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const ANDROID = "scripts/android/bootstrap.sh";
const IOS = "scripts/ios/bootstrap.sh";

const issues: GateIssue[] = [];

function checkScript(path: string, label: string, requiredCommands: RegExp[]) {
  if (!existsSync(path)) {
    issues.push({ severity: "error", area: "missing", message: `${label} bootstrap missing: ${path}` });
    return;
  }
  const content = readFileSync(path, "utf8");
  // Shebang + set -euo pipefail
  if (!content.startsWith("#!")) {
    issues.push({ severity: "error", area: "shape", message: `${path} missing shebang` });
  }
  if (!/set -euo pipefail/.test(content)) {
    issues.push({ severity: "error", area: "shape", message: `${path} missing 'set -euo pipefail' (must fail-fast)` });
  }
  // Required commands
  for (const cmd of requiredCommands) {
    if (!cmd.test(content)) {
      issues.push({ severity: "error", area: "command", message: `${path} missing required command: ${cmd.source}` });
    }
  }
  // Executable bit (may not survive in all VCS configs; advisory only on web sandbox)
  try {
    const mode = statSync(path).mode;
    if ((mode & 0o111) === 0) {
      issues.push({ severity: "warning", area: "perms", message: `${path} not executable (chmod +x) — may need to run via 'bash <path>'` });
    }
  } catch {}
}

checkScript(ANDROID, "Android", [
  /npm run build/,
  /cap add android/,
  /cap sync android/,
  /gradlew/,
]);

checkScript(IOS, "iOS", [
  /npm run build/,
  /cap add ios/,
  /cap sync ios/,
  /pod install/,
]);

// Both scripts must have post-generation validation
if (existsSync(ANDROID)) {
  const a = readFileSync(ANDROID, "utf8");
  if (!/Validating generated/.test(a)) {
    issues.push({ severity: "error", area: "validation", message: `${ANDROID} missing post-generation validation block` });
  }
}
if (existsSync(IOS)) {
  const i = readFileSync(IOS, "utf8");
  if (!/Validating generated/.test(i)) {
    issues.push({ severity: "error", area: "validation", message: `${IOS} missing post-generation validation block` });
  }
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-bootstrap-contract",
  ok,
  issues,
  extra: { scriptsChecked: [ANDROID, IOS] },
});
console.log(`mobile-bootstrap-contract: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);
