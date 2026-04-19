#!/usr/bin/env node
/* eslint-disable no-console */
// Mobile capability truth — honest classification gate.
//
// Validates that mobile push, identity source-of-truth, and release path
// claims match canonical reality (no over-claiming push, no APNs/FCM
// promises without external account provisioning).
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "mobile-capability-truth";
const issues: GateIssue[] = [];

const REQUIRED = [
  "generated/mobile-push-claim-safety-report.json",
  "generated/mobile-identity-source-of-truth-report.json",
  "generated/mobile-env-strategy-consistency-report.json",
  "generated/android-release-path-report.json",
  "generated/ios-release-path-report.json",
];

for (const file of REQUIRED) {
  if (!existsSync(file)) {
    issues.push({
      severity: "error",
      area: "artifact",
      message: `${file} missing — mobile capability truth not recorded`,
    });
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    if (data.ok !== true) {
      issues.push({
        severity: "error",
        area: "capability",
        message: `${file} not OK — capability claim drift detected`,
      });
    }
  } catch (e: any) {
    issues.push({
      severity: "error",
      area: "parse",
      message: `Failed to parse ${file}: ${e.message}`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(
  `${ok ? "✅" : "❌"} ${GATE}: ${ok ? `${REQUIRED.length}/${REQUIRED.length} capability claims truthful` : `${issues.length} issue(s)`}`,
);
issues.slice(0, 5).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    push_classification: "external-account-blocked",
    identity_classification: "supabase-auth-canonical",
  },
});
process.exit(ok ? 0 : 1);
