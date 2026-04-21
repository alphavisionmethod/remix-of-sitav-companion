#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Memory Repair Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { MEMORY_REPAIR_ENTRIES } from "../../../src/lib/ai/ai-memory-repair-manager";

const issues: GateIssue[] = [];
if (MEMORY_REPAIR_ENTRIES.length < 3) issues.push({ severity: "warning", area: "memory-repair", message: `Only ${MEMORY_REPAIR_ENTRIES.length} repair domains (expected 3+)` });

for (const e of MEMORY_REPAIR_ENTRIES) {
  if (e.preconditions.length === 0) issues.push({ severity: "warning", area: "memory-repair", message: `${e.domainId}: no preconditions` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-memory-repair", ok, issues });
console.log(`AI memory repair: ${ok ? "✅" : "❌"} → ${file}`);