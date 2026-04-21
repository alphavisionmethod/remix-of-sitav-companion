#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Evidence Grade Coverage Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { AI_SURFACE_EVIDENCE_POLICIES } from "../../../src/lib/ai/ai-evidence-grade-policy";

const issues: GateIssue[] = [];
if (AI_SURFACE_EVIDENCE_POLICIES.length < 4) issues.push({ severity: "warning", area: "evidence", message: `Only ${AI_SURFACE_EVIDENCE_POLICIES.length} surfaces declared (expected 4+)` });

const actionCapable = AI_SURFACE_EVIDENCE_POLICIES.filter((s) => s.surfaceType === "action-capable");
for (const s of actionCapable) {
  if (s.requiredEvidenceGrade !== "A") issues.push({ severity: "warning", area: "evidence", message: `Action-capable surface ${s.surfaceId} requires grade ${s.requiredEvidenceGrade} (expected A)` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-evidence-grade-coverage", ok, issues });
console.log(`AI evidence grade coverage: ${ok ? "✅" : "❌"} → ${file}`);