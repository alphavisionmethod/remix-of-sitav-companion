#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — OAuth Security Closure Validator (BLOCK)
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { OAUTH_SECURITY_POLICY } from "../../src/lib/integrations/oauth-security-closure";

const issues: GateIssue[] = [];

if (!OAUTH_SECURITY_POLICY.encryptionAtRest.enabled) {
  issues.push({ severity: "error", area: "encryption", message: "Encryption at rest not enabled" });
}
if (!OAUTH_SECURITY_POLICY.tokenAccessAuditing.enabled) {
  issues.push({ severity: "error", area: "auditing", message: "Token access auditing not enabled" });
}
if (!OAUTH_SECURITY_POLICY.supportSafeRedaction.enabled) {
  issues.push({ severity: "warning", area: "redaction", message: "Support-safe redaction not enabled" });
}
console.log(`  🔐 OAuth: encryption=${OAUTH_SECURITY_POLICY.encryptionAtRest.algorithm}, rotation=${OAUTH_SECURITY_POLICY.encryptionAtRest.keyRotationDays}d`);

const ok = issues.filter(i => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "oauth-security-closure", ok, issues });
console.log(`OAuth security closure: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);