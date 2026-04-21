#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — AI Fallback Replay Validator (BLOCK)
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";
import { FALLBACK_POLICIES, REPLAY_FAMILIES } from "../../../src/lib/ai/ai-fallback-policy";
import { ROUTING_REPLAY_FAMILIES } from "../../../src/lib/ai/ai-routing-replay";

const issues: GateIssue[] = [];

for (const p of FALLBACK_POLICIES) {
  if (p.fallbackChain.length === 0 && p.noProviderBehavior !== "cached-only") {
    issues.push({ severity: "warning", area: "fallback", message: `${p.capabilityId}: no fallback chain and not cached-only` });
  }
}

if (REPLAY_FAMILIES.length === 0) issues.push({ severity: "error", area: "replay", message: "No replay families declared" });

const fullReplayCount = ROUTING_REPLAY_FAMILIES.filter((f) => f.supportsFullReplay).length;
if (fullReplayCount < 5) issues.push({ severity: "error", area: "replay", message: `Only ${fullReplayCount} capabilities support full replay (expected 5+)` });

const ok = issues.filter((i) => i.severity === "error").length === 0;
const file = emitGateReport({ gate: "ai-fallback-replay", ok, issues });
console.log(`AI fallback replay: ${ok ? "✅" : "❌"} → ${file}`);
if (!ok) process.exit(1);