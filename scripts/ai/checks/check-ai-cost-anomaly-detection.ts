#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Cost Anomaly Detection Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { AI_COST_ANOMALY_RULES } from "../../../src/lib/ai/ai-cost-anomaly-detector";

const issues: GateIssue[] = [];
if (AI_COST_ANOMALY_RULES.length < 5) issues.push({ severity: "warning", area: "cost-anomaly", message: `Only ${AI_COST_ANOMALY_RULES.length} rules (expected 5+)` });

const criticalRules = AI_COST_ANOMALY_RULES.filter((r) => r.alertSeverity === "critical");
if (criticalRules.length < 2) issues.push({ severity: "warning", area: "cost-anomaly", message: `Only ${criticalRules.length} critical rules (expected 2+)` });

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-cost-anomaly-detection", ok, issues });
console.log(`AI cost anomaly detection: ${ok ? "✅" : "❌"} → ${file}`);