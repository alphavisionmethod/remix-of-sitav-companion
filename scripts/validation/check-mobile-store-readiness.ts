#!/usr/bin/env node
/* eslint-disable no-console */
// Mobile store readiness — honest classification gate.
//
// Per project memory: SITA OS is desktop/Ubuntu-primary. The mobile path is
// code-complete (Capacitor SPA wrap) but classified as
// "external-account-blocked" because Apple Developer + Google Play accounts
// have not been provisioned. This gate proves that the project does NOT
// claim store-ready state without those external accounts and that the
// honest classification is recorded in the canonical mobile artifacts.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "mobile-store-readiness";
const issues: GateIssue[] = [];

const SUBMISSION = "generated/mobile-submission-blockers-report.json";
const NO_CLAIMS = "generated/no-active-native-mobile-claims-report.json";
const ARCHIVE = "generated/mobile-manifest-archive-classification-report.json";

if (!existsSync(SUBMISSION)) {
  issues.push({
    severity: "error",
    area: "artifact",
    message: `${SUBMISSION} missing — mobile submission blockers not classified`,
  });
} else {
  const data = JSON.parse(readFileSync(SUBMISSION, "utf-8"));
  if (data.ok !== true) {
    issues.push({
      severity: "error",
      area: "submission-blockers",
      message: "mobile-submission-blockers-report not OK — blockers not honestly recorded",
    });
  }
}

if (!existsSync(NO_CLAIMS)) {
  issues.push({
    severity: "error",
    area: "artifact",
    message: `${NO_CLAIMS} missing — store-ready claim safety unverified`,
  });
} else {
  const data = JSON.parse(readFileSync(NO_CLAIMS, "utf-8"));
  if (data.ok !== true) {
    issues.push({
      severity: "error",
      area: "claim-drift",
      message: "Active native mobile claims detected — would mislead operators about store readiness",
    });
  }
}

if (!existsSync(ARCHIVE)) {
  issues.push({
    severity: "error",
    area: "artifact",
    message: `${ARCHIVE} missing — mobile archive classification not recorded`,
  });
} else {
  const data = JSON.parse(readFileSync(ARCHIVE, "utf-8"));
  if (data.ok !== true) {
    issues.push({
      severity: "error",
      area: "archive-classification",
      message: "Mobile archive classification not OK — desktop-primary truth not enforced",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(
  `${ok ? "✅" : "❌"} ${GATE}: ${ok ? "honest classification recorded (external-account-blocked)" : `${issues.length} issue(s)`}`,
);
issues.slice(0, 5).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "external-account-blocked",
    primary_platform: "desktop-ubuntu",
    mobile_status: "code-complete-account-blocked",
  },
});
process.exit(ok ? 0 : 1);
