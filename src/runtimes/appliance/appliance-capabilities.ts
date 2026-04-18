// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Capabilities
// Per-capability availability under the APPLIANCE_RUNTIME tier.
// ═══════════════════════════════════════════════════════════════

import type { TierAvailability } from "../runtime-tier-model";

export interface ApplianceCapabilityEntry {
  capabilityId: string;
  availability: TierAvailability;
  managedBy?: string;
  notes?: string;
}

export const APPLIANCE_CAPABILITY_MAP: readonly ApplianceCapabilityEntry[] = [
  { capabilityId: "first-boot-ceremony", availability: "supported", managedBy: "appliance-init" },
  { capabilityId: "ota-update", availability: "supported", managedBy: "ota-update-agent" },
  { capabilityId: "recovery", availability: "supported", managedBy: "recovery-agent" },
  { capabilityId: "managed-runtime-services", availability: "supported", managedBy: "service-supervisor" },
  { capabilityId: "filesystem-local", availability: "supported" },
  { capabilityId: "local-backup", availability: "supported" },
  { capabilityId: "auth", availability: "supported" },
  { capabilityId: "data-persistence", availability: "supported" },
  { capabilityId: "ai-inference", availability: "supported" },
  { capabilityId: "notifications-native", availability: "fallback", notes: "OS-native unless headless" },
  { capabilityId: "notifications-push", availability: "prohibited", notes: "Appliance is server-side" },
  { capabilityId: "window-control", availability: "prohibited" },
  { capabilityId: "tray-icon", availability: "prohibited" },
  { capabilityId: "menu-bar", availability: "prohibited" },
  { capabilityId: "bespoke-kernel", availability: "roadmap" },
  { capabilityId: "tpm-attestation", availability: "roadmap" },
] as const;

export function getApplianceCapability(capabilityId: string): ApplianceCapabilityEntry | undefined {
  return APPLIANCE_CAPABILITY_MAP.find((c) => c.capabilityId === capabilityId);
}
