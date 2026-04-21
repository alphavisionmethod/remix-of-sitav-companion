#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Autonomy Ceiling Validator (BLOCK)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { AUTONOMY_CEILING_MAP } from "../../../src/lib/ai/ai-autonomy-ceiling-policy";

const issues: GateIssue[] = [];

const advisors = AUTONOMY_CEILING_MAP.filter((e) => e.agentType === "advisor");
if (advisors.length < 5) issues.push({ severity: "error", area: "autonomy", message: `Only ${advisors.length} advisors have ceilings (expected 5+)` });

for (const entry of AUTONOMY_CEILING_MAP) {
  if (entry.blockedActions.length === 0) issues.push({ severity: "warning", area: "autonomy", message: `${entry.agentId}: no blocked actions declared` });
  if (!entry.escalationPath) issues.push({ severity: "error", area: "autonomy", message: `${entry.agentId}: no escalation path` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-autonomy-ceiling", ok, issues });
console.log(`AI autonomy ceiling: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);