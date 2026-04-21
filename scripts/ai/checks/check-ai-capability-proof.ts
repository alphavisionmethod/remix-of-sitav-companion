#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Capability Proof Validator (BLOCK)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { AI_CAPABILITY_REGISTRY } from "../../../src/lib/ai/ai-capability-registry";

const issues: GateIssue[] = [];

for (const cap of AI_CAPABILITY_REGISTRY) {
  if (cap.allowedModels.length === 0) issues.push({ severity: "error", area: "capability", message: `${cap.capabilityId}: no allowed models` });
  if (cap.fallbackChain.length === 0) issues.push({ severity: "warning", area: "fallback", message: `${cap.capabilityId}: empty fallback chain` });
  if (cap.refusalConditions.length === 0) issues.push({ severity: "warning", area: "refusal", message: `${cap.capabilityId}: no refusal conditions` });
  if (!cap.evidenceGradeRequired) issues.push({ severity: "error", area: "evidence", message: `${cap.capabilityId}: no evidence grade` });
}

if (AI_CAPABILITY_REGISTRY.length < 10) issues.push({ severity: "error", area: "coverage", message: `Only ${AI_CAPABILITY_REGISTRY.length} capabilities registered (expected 10+)` });

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-capability-proof", ok, issues });
console.log(`AI capability proof: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);