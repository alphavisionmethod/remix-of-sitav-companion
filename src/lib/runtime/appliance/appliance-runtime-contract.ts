// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Runtime Contract
// Defines the APPLIANCE_RUNTIME tier (ISO/OVA/bootable image).
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "../runtime-tier-model";

export const APPLIANCE_RUNTIME_TIER: RuntimeTier = "APPLIANCE_RUNTIME";

export interface ApplianceRuntimeContract {
  tier: typeof APPLIANCE_RUNTIME_TIER;
  hostAuthority: "appliance-runtime";
  /** Required first-boot phases. */
  firstBootPhases: readonly string[];
  /** Required runtime services (started by appliance init). */
  runtimeServices: readonly string[];
  /** Capabilities the appliance honestly delivers today. */
  honestCapabilities: readonly string[];
  /** Capabilities marketed only after real implementation lands. */
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
