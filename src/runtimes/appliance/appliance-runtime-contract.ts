// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Runtime Contract (consolidated re-export)
// Re-exports the canonical capability contract from parent dir
// AND preserves the legacy APPLIANCE_RUNTIME_CONTRACT shape
// consumed by admin pages and CI validators.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "../runtime-tier-model";

export {
  APPLIANCE_RUNTIME_CAPABILITIES,
  getApplianceCapability,
  getApplianceClaimState,
  type ApplianceCapability,
  type ApplianceCapabilityState,
  type ApplianceCapabilityEntry,
} from "../appliance-runtime-contract";

// ── Legacy shape (preserved for back-compat) ────────────────────

export const APPLIANCE_RUNTIME_TIER: RuntimeTier = "APPLIANCE_RUNTIME";

export interface ApplianceRuntimeContract {
  tier: typeof APPLIANCE_RUNTIME_TIER;
  hostAuthority: "appliance-runtime";
  firstBootPhases: readonly string[];
  runtimeServices: readonly string[];
  honestCapabilities: readonly string[];
  roadmapCapabilities: readonly string[];
}

export const APPLIANCE_RUNTIME_CONTRACT: ApplianceRuntimeContract = {
  tier: APPLIANCE_RUNTIME_TIER,
  hostAuthority: "appliance-runtime",
  firstBootPhases: [
    "hardware-detection",
    "secure-init-ceremony",
    "network-bootstrap",
    "runtime-services-start",
    "first-user-handoff",
  ],
  runtimeServices: [
    "supabase-stack",
    "edge-runtime",
    "ota-update-agent",
    "recovery-agent",
    "health-watchdog",
  ],
  honestCapabilities: [
    "first-boot-ceremony",
    "appliance-service-startup",
    "recovery-scripts",
    "ota-update-daemon",
    "managed-runtime-services",
    "consistent-packaged-environment",
  ],
  roadmapCapabilities: [
    "bespoke-kernel",
    "tpm-attestation",
    "hardware-secure-enclave",
  ],
} as const;
