#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Boardroom Outcome Scoring Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { BOARDROOM_QUALITY_DIMENSIONS } from "../../../src/lib/ai/boardroom-outcome-scoring";

const issues: GateIssue[] = [];
if (BOARDROOM_QUALITY_DIMENSIONS.length < 5) issues.push({ severity: "warning", area: "boardroom-scoring", message: `Only ${BOARDROOM_QUALITY_DIMENSIONS.length} quality dimensions (expected 5+)` });

const totalWeight = BOARDROOM_QUALITY_DIMENSIONS.reduce((s, d) => s + d.weight, 0);
if (Math.abs(totalWeight - 1.0) > 0.01) issues.push({ severity: "warning", area: "boardroom-scoring", message: `Total weight is ${totalWeight} (expected 1.0)` });

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "boardroom-outcome-scoring", ok, issues });
console.log(`Boardroom outcome scoring: ${ok ? "✅" : "❌"} → ${file}`);