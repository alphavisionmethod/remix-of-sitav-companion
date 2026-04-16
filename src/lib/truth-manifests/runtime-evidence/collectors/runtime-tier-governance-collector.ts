// ═══════════════════════════════════════════════════════════════
// Runtime Tier Governance Collector
// Wraps the existing tier-governance validator output as evidence.
// ═══════════════════════════════════════════════════════════════

import { makeRecord } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";
import {
  RUNTIME_TIERS,
  type RuntimeTier,
} from "@/lib/runtime/runtime-tier-model";
import { detectActiveRuntimeTier } from "@/lib/runtime/runtime-detection";

/**
 * The tier-governance manifest is fed by `scripts/runtime/run-runtime-tier-governance.ts`,
 * which produces `generated/runtime-tier-governance-report.json` from the static tier
 * registry. That validator is the source of authority — this collector publishes a live
 * evidence record summarising which tier is active and which tier definitions are loaded
 * in this runtime, so the manifest registry can prove the report is wired to a real
 * runtime probe rather than to "derived" paperwork.
 */
export function collectRuntimeTierGovernanceEvidence(): RuntimeEvidenceRecord {
  const activeTier = detectActiveRuntimeTier();
  const tierSummaries = RUNTIME_TIERS.map((t) => ({
    tier: t.tier,
    ordinal: t.ordinal,
    label: t.label,
    hostAuthority: t.hostAuthority,
    honestOSAuthority: t.honestOSAuthority,
    isActive: t.tier === (activeTier as RuntimeTier),
  }));
  return makeRecord(
    "collector.runtime-tier-governance",
    "manifest-runtime-tier-governance-report",
    {
      activeTier,
      tiers: tierSummaries,
    },
    { itemCount: tierSummaries.length },
  );
}
