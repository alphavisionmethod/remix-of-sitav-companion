#!/usr/bin/env node
/* eslint-disable no-console */
// Verifies that every gate marked shallow in gate-meaningfulness-status.json
// has a corresponding GH-NNN hardening ticket in GATE_HARDENING_PLAN.md.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/final-proof-verification/gate-meaningfulness-status.json";
const PLAN = "generated/final-proof-verification/GATE_HARDENING_PLAN.md";

const issues: GateIssue[] = [];

if (!existsSync(STATUS)) issues.push({ severity: "error", area: "status", message: `${STATUS} missing` });
if (!existsSync(PLAN)) issues.push({ severity: "error", area: "plan", message: `${PLAN} missing` });

let shallow: string[] = [];
let totalGates = 0;
if (existsSync(STATUS)) {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  shallow = s.shallowGatesWithHardeningPlan ?? [];
  totalGates = s.totalGatesAudited ?? 0;
}

if (existsSync(PLAN) && shallow.length) {
  const md = readFileSync(PLAN, "utf-8");
  const ticketCount = (md.match(/^### GH-\d+/gm) ?? []).length;
  if (ticketCount < shallow.length) {
    issues.push({
      severity: "error",
      area: "plan-coverage",
      message: `${shallow.length} shallow gates declared but only ${ticketCount} GH-NNN tickets present`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} gate-meaningfulness: ${totalGates} gates audited, ${shallow.length} shallow with plan`);
issues.forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "gate-meaningfulness",
  ok,
  issues,
  extra: { totalGates, shallowGates: shallow.length },
});
process.exit(ok ? 0 : 1);
