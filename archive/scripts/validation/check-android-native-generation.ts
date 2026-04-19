// SITA OS — Android native generation validator (identity reconciliation pass)
// Asserts Android bootstrap script is hardened: pre-flight, version pins,
// post-generation validation, explicit exit codes. Stronger than the closure
// pass (check-android-release-path.ts) — focuses on generation contract not signing.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const SCRIPT = "scripts/android/bootstrap.sh";
const issues: GateIssue[] = [];

if (!existsSync(SCRIPT)) {
  issues.push({ severity: "error", area: "missing", message: `${SCRIPT} missing — Android cannot be generated` });
} else {
  const s = readFileSync(SCRIPT, "utf8");
  // Pre-flight tooling
  if (!/command -v node/.test(s))  issues.push({ severity: "error", area: "preflight", message: "bootstrap missing node presence check" });
  if (!/command -v java/.test(s))  issues.push({ severity: "error", area: "preflight", message: "bootstrap missing java presence check" });
  if (!/command -v npx/.test(s))   issues.push({ severity: "error", area: "preflight", message: "bootstrap missing npx presence check" });
  if (!/command -v rsync/.test(s)) issues.push({ severity: "error", area: "preflight", message: "bootstrap missing rsync presence check" });
  // Version pins
  if (!/REQUIRED_NODE_MAJOR=\d+/.test(s)) issues.push({ severity: "error", area: "pin", message: "bootstrap missing Node version pin (REQUIRED_NODE_MAJOR)" });
  if (!/REQUIRED_JAVA_MAJOR=\d+/.test(s)) issues.push({ severity: "error", area: "pin", message: "bootstrap missing Java version pin (REQUIRED_JAVA_MAJOR)" });
  // Cap commands
  if (!/cap add android/.test(s))  issues.push({ severity: "error", area: "generation", message: "bootstrap missing 'cap add android' invocation" });
  if (!/cap sync android/.test(s)) issues.push({ severity: "error", area: "generation", message: "bootstrap missing 'cap sync android' invocation" });
  // Post-generation validation
  if (!/Validating generated Android project/.test(s)) issues.push({ severity: "error", area: "post-gen", message: "bootstrap missing post-generation validation block" });
  if (!/AndroidManifest\.xml/.test(s)) issues.push({ severity: "error", area: "post-gen", message: "bootstrap missing AndroidManifest.xml existence check" });
  // Build output validation
  if (!/assembleDebug/.test(s)) issues.push({ severity: "error", area: "build", message: "bootstrap missing assembleDebug step" });
  if (!/\.apk/.test(s)) issues.push({ severity: "error", area: "post-build", message: "bootstrap missing APK existence check" });
  // Explicit exit codes
  if (!/exit 2/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 2 (preflight failure)" });
  if (!/exit 3/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 3 (web build failure)" });
  if (!/exit 4/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 4 (post-gen failure)" });
  if (!/exit 5/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 5 (build failure)" });
}

// CI mirror exists
if (!existsSync(".github/workflows/mobile-build.yml")) {
  issues.push({ severity: "warning", area: "ci", message: ".github/workflows/mobile-build.yml missing — no CI mirror of bootstrap" });
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "android-native-generation",
  ok,
  issues,
  extra: { script: SCRIPT, contract: "on-demand, version-pinned, post-validated" },
});
console.log(`android-native-generation: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);
