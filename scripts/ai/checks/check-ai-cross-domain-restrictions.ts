#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Cross-Domain Restrictions Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { CROSS_DOMAIN_RESTRICTIONS } from "../../../src/lib/ai/ai-cross-domain-restriction-map";

const issues: GateIssue[] = [];
if (CROSS_DOMAIN_RESTRICTIONS.length < 5) issues.push({ severity: "warning", area: "cross-domain", message: `Only ${CROSS_DOMAIN_RESTRICTIONS.length} advisors with restrictions (expected 5+)` });

for (const r of CROSS_DOMAIN_RESTRICTIONS) {
  if (r.allowedDomains.length === 0 && r.advisorId !== "strategy-advisor") {
    issues.push({ severity: "warning", area: "cross-domain", message: `${r.advisorId}: no allowed domains` });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-cross-domain-restrictions", ok, issues });
console.log(`AI cross-domain restrictions: ${ok ? "✅" : "❌"} → ${file}`);