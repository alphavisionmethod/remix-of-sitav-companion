// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Fallbacks
// What to do when an appliance-only capability is requested
// from a non-appliance runtime.
// ═══════════════════════════════════════════════════════════════

export interface ApplianceFallback {
  capabilityId: string;
  webFallback: string;
  desktopFallback: string;
}

export const APPLIANCE_FALLBACKS: readonly ApplianceFallback[] = [
  {
    capabilityId: "first-boot-ceremony",
    webFallback: "Show appliance walkthrough video with link to ISO download.",
    desktopFallback: "Link to appliance docs; do not impersonate boot ceremony.",
  },
  {
    capabilityId: "ota-update",
    webFallback: "Hide; OTA only applies to appliance deployments.",
    desktopFallback: "Show desktop auto-updater status instead.",
  },
  {
    capabilityId: "recovery",
    webFallback: "Hide; recovery is appliance-runtime only.",
    desktopFallback: "Hide; desktop apps use OS-level recovery.",
  },
];

export function getApplianceFallback(capabilityId: string): ApplianceFallback | undefined {
  return APPLIANCE_FALLBACKS.find((f) => f.capabilityId === capabilityId);
}
