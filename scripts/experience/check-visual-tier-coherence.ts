#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { VISUAL_TIERS, VISUAL_TIER_COUNT, getAllTierIds } from "../../src/platform/experience/visual-tier-system";

const issues: GateIssue[] = [];

if (VISUAL_TIER_COUNT < 5) issues.push({ severity: "error", area: "tier-count", message: `Expected ≥5 tiers, found ${VISUAL_TIER_COUNT}` });

for (const id of getAllTierIds()) {
  const tier = VISUAL_TIERS[id];
  if (tier.tokenSources.length === 0) issues.push({ severity: "error", area: "token-sources", message: `Tier "${id}" has no token sources` });
  if (tier.sharedWithOtherTiers.length === 0 && id !== "TIER_DEGRADED_RECOVERY") {
    issues.push({ severity: "warning", area: "shared-properties", message: `Tier "${id}" declares no shared properties` });
  }
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "visual-tier-coherence", ok: errorCount === 0, issues, extra: { tierCount: VISUAL_TIER_COUNT } });
console.log(`Visual tier coherence: ${VISUAL_TIER_COUNT} tiers → ${file}`);