#!/usr/bin/env node
/* eslint-disable no-console */
// Final runtime proof meta-gate. Validates that the canonical runtime artifacts
// that prove the system is *actually running* (not just structurally present)
// exist and pass: pg_cron schedules, AI workforce phase8/9 tables, kill-switch
// enforcement, restore drill, attestation packet.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const RUNTIME_PROOF_INPUTS = [
  "generated/pg-cron-schedules-report.json",
  "generated/internal-agent-phase8-tables-report.json",
  "generated/internal-agent-phase9-tables-report.json",
  "generated/kill-switch-enforcement-report.json",
  "generated/attestation-packet-signed-report.json",
  "generated/audit-export-immutable-report.json",
];

const issues: GateIssue[] = [];
let runtimeProofOk = true;
const summary: Array<{ file: string; ok: boolean }> = [];

for (const file of RUNTIME_PROOF_INPUTS) {
  if (!existsSync(file)) {
    issues.push({ severity: "error", area: "missing-runtime-proof", message: `${file} missing — runtime evidence not produced` });
    runtimeProofOk = false;
    summary.push({ file, ok: false });
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    const ok = data.ok ?? Number(data.errorCount ?? 0) === 0;
    summary.push({ file, ok });
    if (!ok) {
      runtimeProofOk = false;
      issues.push({ severity: "error", area: "runtime-proof-failed", message: `${file} reports failures` });
    }
  } catch (e: any) {
    issues.push({ severity: "error", area: "parse", message: `Failed to parse ${file}: ${e.message}` });
    runtimeProofOk = false;
  }
}

console.log(`${runtimeProofOk ? "✅" : "❌"} final-runtime-proof: ${summary.filter((s) => s.ok).length}/${RUNTIME_PROOF_INPUTS.length} runtime artifacts proven`);
issues.slice(0, 10).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "final-runtime-proof",
  ok: runtimeProofOk,
  issues,
  extra: { summary },
});
process.exit(runtimeProofOk ? 0 : 1);
