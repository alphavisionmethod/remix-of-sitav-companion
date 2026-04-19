// SITA OS — Native project generation contract validator
// Asserts NATIVE_PROJECT_GENERATION_CONTRACT.md exists and declares the
// canonical generation model: not-committed, on-demand, both bootstrap
// scripts referenced, pinned tool versions stated.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const DOC = "generated/mobile-identity-reconciliation/NATIVE_PROJECT_GENERATION_CONTRACT.md";
const REQUIRED_CLAIMS = [
  /Committed to repo\?\s*\|\s*\*\*NO\*\*\s*\|\s*\*\*NO\*\*/,
  /scripts\/android\/bootstrap\.sh/,
  /scripts\/ios\/bootstrap\.sh/,
  /Node\.js major/,
  /Java JDK major/,
  /Capacitor.*\|\s*6/,
  /iOS deployment target.*16\.0/,
  /Android min SDK.*26/,
  /Android target SDK.*34/,
];

const issues: GateIssue[] = [];

if (!existsSync(DOC)) {
  issues.push({ severity: "error", area: "missing", message: `${DOC} missing — generation has no canonical contract` });
} else {
  const doc = readFileSync(DOC, "utf8");
  for (const claim of REQUIRED_CLAIMS) {
    if (!claim.test(doc)) {
      issues.push({ severity: "error", area: "contract", message: `Contract missing required claim: ${claim.source}` });
    }
  }
  // Failure-diagnostics section required
  if (!/Failure Diagnostics/i.test(doc)) {
    issues.push({ severity: "error", area: "completeness", message: "Contract missing Failure Diagnostics section" });
  }
  // Operator workflow section required
  if (!/Operator Workflow/i.test(doc)) {
    issues.push({ severity: "error", area: "completeness", message: "Contract missing Operator Workflow section" });
  }
}

// Cross-check: the audit doc must also exist
if (!existsSync("generated/mobile-identity-reconciliation/NATIVE_PROJECT_GENERATION_AUDIT.md")) {
  issues.push({ severity: "error", area: "audit", message: "NATIVE_PROJECT_GENERATION_AUDIT.md missing — contract has no underlying audit" });
}

// Cross-check: native projects must NOT be committed (sanity)
if (existsSync("android/app/build.gradle")) {
  issues.push({ severity: "warning", area: "sanity", message: "android/app/build.gradle present — native project appears committed (contract says generated-on-demand)" });
}
if (existsSync("ios/App/App.xcworkspace")) {
  issues.push({ severity: "warning", area: "sanity", message: "ios/App/App.xcworkspace present — native project appears committed (contract says generated-on-demand)" });
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "native-project-generation-contract",
  ok,
  issues,
  extra: { doc: DOC, requiredClaims: REQUIRED_CLAIMS.length },
});
console.log(`native-project-generation-contract: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);
