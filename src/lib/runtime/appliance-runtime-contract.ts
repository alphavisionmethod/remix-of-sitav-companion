// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Runtime Contract
// Tier 3: ISO/OVA appliance with first-boot, OTA, recovery, backup.
// Bound to scripts/release/iso/ and scripts/release/vmware/.
// ═══════════════════════════════════════════════════════════════

export type ApplianceCapability =
  | "first-boot-ceremony"
  | "ota-update"
  | "automatic-backup"
  | "automatic-restore"
  | "rollback"
  | "health-check"
  | "metrics-emission"
  | "managed-runtime-authority"
  | "bespoke-kernel"
  | "ova-export"
  | "iso-build";

export type ApplianceCapabilityState = "real" | "simulated" | "roadmap" | "prohibited";

export interface ApplianceCapabilityEntry {
  readonly capability: ApplianceCapability;
  readonly state: ApplianceCapabilityState;
  readonly artifact: string; // file path proving the implementation
  readonly notes?: string;
}

export const APPLIANCE_RUNTIME_CAPABILITIES: readonly ApplianceCapabilityEntry[] = [
  { capability: "first-boot-ceremony", state: "real", artifact: "scripts/release/iso/sita-first-boot.sh" },
  { capability: "ota-update", state: "real", artifact: "scripts/release/iso/sita-ota-agent.sh" },
  { capability: "automatic-backup", state: "real", artifact: "scripts/release/iso/sita-backup.sh" },
  { capability: "automatic-restore", state: "real", artifact: "scripts/release/iso/sita-backup.sh", notes: "restore companion sourced from same script" },
  { capability: "rollback", state: "real", artifact: "scripts/release/iso/sita-ota-agent.sh", notes: "rollback path inside OTA agent" },
  { capability: "health-check", state: "real", artifact: "scripts/release/iso/sita-os.service" },
  { capability: "metrics-emission", state: "real", artifact: "scripts/release/iso/sita-metrics-agent.sh" },
  { capability: "managed-runtime-authority", state: "real", artifact: "src/lib/runtime/runtime-tier-model.ts", notes: "Honest only at Tier 3" },
  { capability: "bespoke-kernel", state: "roadmap", artifact: "docs/architecture/PRODUCT_REALITY_TIERS.md", notes: "Claim must remain roadmap until real kernel ships" },
  { capability: "ova-export", state: "real", artifact: "scripts/release/vmware/build-ova.sh" },
  { capability: "iso-build", state: "real", artifact: "scripts/release/vmware/generate-vmware-iso-image.ts" },
];

export function getApplianceCapability(cap: ApplianceCapability): ApplianceCapabilityEntry | undefined {
  return APPLIANCE_RUNTIME_CAPABILITIES.find((c) => c.capability === cap);
}

export function getApplianceClaimState(cap: ApplianceCapability): ApplianceCapabilityState {
  return getApplianceCapability(cap)?.state ?? "roadmap";
}
