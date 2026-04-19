#!/usr/bin/env node
/* eslint-disable no-console */
// Final AI workforce readiness meta-gate. Confirms all 9 phases of the
// internal AI workforce + the Phase 4 Security Council board are wired,
// and that the registry/runtime gates all reported success.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const PHASE_GATES = [
  "generated/internal-agent-registry-report.json",
  "generated/internal-agent-runtime-coverage-report.json",
  "generated/internal-agent-runtime-loop-report.json",
  "generated/internal-agent-execute-action-report.json",
  "generated/internal-agent-reflect-function-report.json",
  "generated/suggestion-generator-function-report.json",
  "generated/internal-agent-policy-architect-function-report.json",
  "generated/internal-agent-trust-evaluator-function-report.json",
  "generated/internal-agent-phase7-tables-report.json",
  "generated/internal-agent-phase8-tables-report.json",
  "generated/internal-agent-phase9-tables-report.json",
];

const SECURITY_COUNCIL_PAGE = "src/pages/admin/ai-runtime/SecurityCouncilBoard.tsx";
const SECURITY_COUNCIL_FN = "supabase/functions/security-council-tick/index.ts";
const HUB = "src/pages/admin/ai-runtime/AIRuntimeHome.tsx";

const issues: GateIssue[] = [];
let phasesOk = 0;
for (const file of PHASE_GATES) {
  if (!existsSync(file)) {
    issues.push({ severity: "error", area: "missing-phase-report", message: `${file} not produced` });
    continue;
  }
  try {
    const data = JSON.parse(readFileSync(file, "utf-8"));
    if (data.ok && Number(data.errorCount ?? 0) === 0) phasesOk++;
    else issues.push({ severity: "error", area: "phase-failed", message: `${file} not OK` });
  } catch (e: any) {
    issues.push({ severity: "error", area: "parse", message: e.message });
  }
}

if (!existsSync(SECURITY_COUNCIL_PAGE)) {
  issues.push({ severity: "error", area: "security-council-ui", message: `${SECURITY_COUNCIL_PAGE} missing` });
}
if (!existsSync(SECURITY_COUNCIL_FN)) {
  issues.push({ severity: "error", area: "security-council-fn", message: `${SECURITY_COUNCIL_FN} missing` });
}
if (existsSync(HUB)) {
  const hub = readFileSync(HUB, "utf-8");
  if (!hub.includes('id: "security-council"')) {
    issues.push({ severity: "error", area: "hub-wiring", message: "AIRuntimeHome missing security-council module" });
  }
} else {
  issues.push({ severity: "error", area: "hub-missing", message: `${HUB} missing` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} final-ai-workforce-readiness: ${phasesOk}/${PHASE_GATES.length} phase gates OK · security council ${ok ? "wired" : "incomplete"}`);
issues.slice(0, 10).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "final-ai-workforce-readiness",
  ok,
  issues,
  extra: { phasesOk, totalPhases: PHASE_GATES.length, securityCouncilWired: ok },
});
process.exit(ok ? 0 : 1);
