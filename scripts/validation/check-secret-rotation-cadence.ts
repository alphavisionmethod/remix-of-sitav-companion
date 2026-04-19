#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: Secret Rotation Cadence Completeness
// BLOCK if any canonical secret class is missing required cadence
// metadata (intervalDays, owner, alertSeverity, secretNames).
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { SECRET_ROTATION_CADENCE, SECRET_CLASSES } from "../../src/lib/security/secret-rotation-cadence";
import { emitGateReport } from "./_lib/emit-gate-report";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

for (const cls of SECRET_CLASSES) {
  const policy = SECRET_ROTATION_CADENCE[cls];
  if (!policy) {
    issues.push({ severity: "error", area: cls, message: "Class missing from registry" });
    continue;
  }
  if (!policy.intervalDays || policy.intervalDays < 1) {
    issues.push({ severity: "error", area: cls, message: "intervalDays missing or invalid" });
  }
  if (!policy.staleThresholdDays || policy.staleThresholdDays < 1) {
    issues.push({ severity: "error", area: cls, message: "staleThresholdDays missing" });
  }
  if (!policy.ownerRole) {
    issues.push({ severity: "error", area: cls, message: "ownerRole missing" });
  }
  if (!policy.backupOwnerRole) {
    issues.push({ severity: "error", area: cls, message: "backupOwnerRole missing" });
  }
  if (!Array.isArray(policy.secretNames) || policy.secretNames.length === 0) {
    issues.push({ severity: "error", area: cls, message: "secretNames empty" });
  }
  if (!policy.rationale) {
    issues.push({ severity: "warning", area: cls, message: "rationale empty" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: "secret-rotation-cadence",
  ok,
  issues,
  extra: { totalClasses: SECRET_CLASSES.length },
});
console.log(`[secret-rotation-cadence] ${ok ? "PASS" : "FAIL"} (${issues.length} issues)`);
process.exit(ok ? 0 : 1);
