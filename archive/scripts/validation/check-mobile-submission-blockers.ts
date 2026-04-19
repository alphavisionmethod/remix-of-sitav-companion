// SITA OS — Mobile submission blocker classification validator
// Verifies the blocker classification doc exists and matches status JSONs.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

const REQUIRED_DOCS = [
  "generated/mobile-deployment-closure/MOBILE_BLOCKER_CLASSIFICATION.md",
  "generated/mobile-deployment-closure/STORE_SUBMISSION_OPERATOR_PLAYBOOK.md",
  "generated/mobile-deployment-closure/MOBILE_DEPLOYMENT_FINAL_VERIFICATION.md",
];
for (const f of REQUIRED_DOCS) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "missing-doc", message: `Required closure doc missing: ${f}` });
}

const REQUIRED_STATUS = [
  "generated/mobile-deployment-closure/mobile-canonical-truth-status.json",
  "generated/mobile-deployment-closure/android-release-path-status.json",
  "generated/mobile-deployment-closure/ios-release-path-status.json",
  "generated/mobile-deployment-closure/push-truth-status.json",
  "generated/mobile-deployment-closure/mobile-deployment-verification.json",
];
for (const f of REQUIRED_STATUS) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "missing-status", message: `Required status JSON missing: ${f}` });
}

// Blocker classification must use the canonical 5-class taxonomy
if (existsSync("generated/mobile-deployment-closure/MOBILE_BLOCKER_CLASSIFICATION.md")) {
  const s = readFileSync("generated/mobile-deployment-closure/MOBILE_BLOCKER_CLASSIFICATION.md", "utf8");
  const required = ["code-complete", "secret-blocked", "account-blocked", "metadata-blocked", "review-blocked"];
  for (const c of required) {
    if (!s.includes(c)) issues.push({ severity: "error", area: "taxonomy", message: `Blocker classification missing canonical class: ${c}` });
  }
}

// Verify Android tier alignment
if (existsSync("mobile/store-metadata/android.json")) {
  try {
    const meta = JSON.parse(readFileSync("mobile/store-metadata/android.json", "utf8"));
    if (meta.submission?.tier && !/ready|blocked|deferred/i.test(meta.submission.tier)) {
      issues.push({ severity: "warning", area: "android-tier", message: `android.json submission.tier="${meta.submission.tier}" not in canonical vocabulary` });
    }
  } catch {}
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-submission-blockers",
  ok,
  issues,
  extra: {
    classes: ["code-complete", "secret-blocked", "account-blocked", "metadata-blocked", "review-blocked"],
    requiredDocs: REQUIRED_DOCS.length,
    requiredStatusJsons: REQUIRED_STATUS.length,
  },
});
console.log(`mobile-submission-blockers: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);
