// SITA OS — iOS native generation validator (identity reconciliation pass)
// Asserts iOS bootstrap script lives at scripts/ios/bootstrap.sh (NOT just archive/),
// is hardened with pre-flight, version pins, post-generation validation, and exit codes.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const SCRIPT = "scripts/ios/bootstrap.sh";
const ARCHIVED = "scripts/archive/ios/bootstrap.sh";
const issues: GateIssue[] = [];

if (!existsSync(SCRIPT)) {
  issues.push({ severity: "error", area: "missing", message: `${SCRIPT} missing — iOS bootstrap must be promoted from archive/ to canonical location` });
} else {
  const s = readFileSync(SCRIPT, "utf8");
  // macOS host requirement (iOS-specific)
  if (!/Darwin/.test(s)) issues.push({ severity: "error", area: "preflight", message: "bootstrap missing macOS host check (uname Darwin)" });
  // Required tooling
  if (!/command -v node/.test(s))       issues.push({ severity: "error", area: "preflight", message: "bootstrap missing node presence check" });
  if (!/command -v pod/.test(s))        issues.push({ severity: "error", area: "preflight", message: "bootstrap missing CocoaPods presence check" });
  if (!/command -v xcodebuild/.test(s)) issues.push({ severity: "error", area: "preflight", message: "bootstrap missing xcodebuild presence check" });
  if (!/command -v rsync/.test(s))      issues.push({ severity: "error", area: "preflight", message: "bootstrap missing rsync presence check" });
  // Version pin
  if (!/REQUIRED_NODE_MAJOR=\d+/.test(s)) issues.push({ severity: "error", area: "pin", message: "bootstrap missing Node version pin" });
  // Cap commands
  if (!/cap add ios/.test(s))  issues.push({ severity: "error", area: "generation", message: "bootstrap missing 'cap add ios' invocation" });
  if (!/cap sync ios/.test(s)) issues.push({ severity: "error", area: "generation", message: "bootstrap missing 'cap sync ios' invocation" });
  // pod install
  if (!/pod install/.test(s)) issues.push({ severity: "error", area: "deps", message: "bootstrap missing 'pod install' step" });
  // Post-generation validation
  if (!/Validating generated iOS project/.test(s)) issues.push({ severity: "error", area: "post-gen", message: "bootstrap missing post-generation validation block" });
  if (!/App\.xcworkspace/.test(s))  issues.push({ severity: "error", area: "post-gen", message: "bootstrap missing App.xcworkspace existence check" });
  if (!/Podfile\.lock/.test(s))     issues.push({ severity: "error", area: "post-gen", message: "bootstrap missing Podfile.lock existence check" });
  if (!/Info\.plist/.test(s))       issues.push({ severity: "error", area: "post-gen", message: "bootstrap missing Info.plist existence check" });
  // Explicit exit codes
  if (!/exit 2/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 2 (preflight failure)" });
  if (!/exit 3/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 3 (web build failure)" });
  if (!/exit 4/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 4 (post-gen failure)" });
  if (!/exit 5/.test(s)) issues.push({ severity: "error", area: "diagnostics", message: "bootstrap missing exit code 5 (workspace failure)" });
}

// Archive notice (informational)
const archivePresent = existsSync(ARCHIVED);

if (!existsSync(".github/workflows/mobile-build.yml")) {
  issues.push({ severity: "warning", area: "ci", message: ".github/workflows/mobile-build.yml missing — no CI mirror of bootstrap" });
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "ios-native-generation",
  ok,
  issues,
  extra: {
    script: SCRIPT,
    archivedCopyStillPresent: archivePresent,
    contract: "on-demand, version-pinned, post-validated, macOS-only",
    blockerClass: "code-ready (signing is account-blocked separately)",
  },
});
console.log(`ios-native-generation: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);
