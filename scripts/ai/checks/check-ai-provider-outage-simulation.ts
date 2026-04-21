#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Provider Outage Simulation Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { OUTAGE_SCENARIOS } from "../../../src/lib/ai/ai-provider-outage-simulator";

const issues: GateIssue[] = [];
if (OUTAGE_SCENARIOS.length < 5) issues.push({ severity: "warning", area: "outage-sim", message: `Only ${OUTAGE_SCENARIOS.length} scenarios (expected 5+)` });

for (const s of OUTAGE_SCENARIOS) {
  if (s.recoverySteps.length === 0) issues.push({ severity: "warning", area: "outage-sim", message: `Scenario ${s.scenarioId} has no recovery steps` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-provider-outage-simulation", ok, issues });
console.log(`AI provider outage simulation: ${ok ? "✅" : "❌"} → ${file}`);