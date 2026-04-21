#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Receipt Reconstruction Validator (ADVISORY)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { RECEIPT_RECONSTRUCTION_MAP } from "../../../src/lib/ai/ai-receipt-reconstruction";
import { AI_CAPABILITY_REGISTRY } from "../../../src/lib/ai/ai-capability-registry";

const issues: GateIssue[] = [];
const criticalCaps = AI_CAPABILITY_REGISTRY.filter((c) => c.actionBoundarySensitivity === "critical");
for (const cap of criticalCaps) {
  const entry = RECEIPT_RECONSTRUCTION_MAP.find((e) => e.capabilityId === cap.capabilityId);
  if (!entry) issues.push({ severity: "warning", area: "reconstruction", message: `Critical capability ${cap.capabilityId} has no reconstruction entry` });
  else if (!entry.supportsDeterministicReconstruction) issues.push({ severity: "warning", area: "reconstruction", message: `Critical capability ${cap.capabilityId} lacks deterministic reconstruction` });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-receipt-reconstruction", ok, issues });
console.log(`AI receipt reconstruction: ${ok ? "✅" : "❌"} → ${file}`);