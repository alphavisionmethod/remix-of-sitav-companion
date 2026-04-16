// ═══════════════════════════════════════════════════════════════
// Runtime Tier Collector
// Probes the active runtime tier and conformance posture.
// ═══════════════════════════════════════════════════════════════

import { makeRecord } from "./_helpers";
import type { RuntimeEvidenceRecord } from "../runtime-evidence-types";
import { probeRuntimeTier } from "@/lib/runtime/runtime-detection";
import { getRuntimeTier } from "@/lib/runtime/runtime-tier-model";

export function collectRuntimeTierEvidence(): RuntimeEvidenceRecord {
  const probe = probeRuntimeTier();
  const def = getRuntimeTier(probe.tier);

  return makeRecord(
    "collector.runtime-tier",
    "manifest-runtime-conformance",
    {
      tier: probe.tier,
      ordinal: def.ordinal,
      hostAuthority: def.hostAuthority,
      honestOSAuthority: def.honestOSAuthority,
      isAppliance: probe.isAppliance,
      isDesktop: probe.isDesktop,
      isWeb: probe.isWeb,
      supportsSimulatedShell: probe.supportsSimulatedShell,
      detectedAt: probe.detectedAt,
    },
    { itemCount: 1 },
  );
}
