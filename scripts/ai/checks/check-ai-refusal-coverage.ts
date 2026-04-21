#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Refusal Coverage Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { REFUSAL_POLICIES } from "../../../src/lib/ai/ai-refusal-policy";
import { AI_CAPABILITY_REGISTRY } from "../../../src/lib/ai/ai-capability-registry";

const issues: GateIssue[] = [];
if (REFUSAL_POLICIES.length < 5) issues.push({ severity: "warning", area: "refusal", message: `Only ${REFUSAL_POLICIES.length} refusal trigger categories (expected 5+)` });

const capsWithRefusal = AI_CAPABILITY_REGISTRY.filter((c) => c.refusalConditions.length > 0).length;
const pct = Math.round((capsWithRefusal / AI_CAPABILITY_REGISTRY.length) * 100);
if (pct < 80) issues.push({ severity: "warning", area: "refusal-coverage", message: `Refusal coverage: ${pct}% (target 80%+)` });

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-refusal-coverage", ok, issues, extra: { coveragePct: pct } });
console.log(`AI refusal coverage: ${ok ? "✅" : "❌"} → ${file}`);