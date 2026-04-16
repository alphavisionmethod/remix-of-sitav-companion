// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Capability Matrix
// Cross-runtime capability matrix (web/desktop/mobile/appliance)
// ═══════════════════════════════════════════════════════════════

export type RuntimeSurface = "web" | "desktop" | "mobile-pwa" | "appliance";
export type CapabilityAvailability = "native" | "fallback" | "unavailable";

export interface RuntimeCapabilityEntry {
  capabilityId: string;
  name: string;
  web: CapabilityAvailability;
  desktop: CapabilityAvailability;
  mobilePwa: CapabilityAvailability;
  appliance: CapabilityAvailability;
}

export const RUNTIME_CAPABILITY_MATRIX: readonly RuntimeCapabilityEntry[] = [
  { capabilityId: "auth", name: "Authentication", web: "native", desktop: "native", mobilePwa: "native", appliance: "native" },
  { capabilityId: "data-persistence", name: "Cloud Data Persistence", web: "native", desktop: "native", mobilePwa: "native", appliance: "native" },
  { capabilityId: "realtime", name: "Realtime Subscriptions", web: "native", desktop: "native", mobilePwa: "native", appliance: "native" },
  { capabilityId: "ai-inference", name: "AI Inference", web: "native", desktop: "native", mobilePwa: "native", appliance: "native" },
  { capabilityId: "notifications-push", name: "Push Notifications", web: "native", desktop: "native", mobilePwa: "fallback", appliance: "unavailable" },
  { capabilityId: "notifications-native", name: "Native OS Notifications", web: "fallback", desktop: "native", mobilePwa: "fallback", appliance: "unavailable" },
  { capabilityId: "filesystem-local", name: "Local Filesystem Access", web: "fallback", desktop: "native", mobilePwa: "unavailable", appliance: "native" },
  { capabilityId: "auto-update", name: "Auto-Update", web: "native", desktop: "native", mobilePwa: "native", appliance: "unavailable" },
  { capabilityId: "window-control", name: "Window Management", web: "unavailable", desktop: "native", mobilePwa: "unavailable", appliance: "unavailable" },
  { capabilityId: "deep-linking", name: "Deep Linking", web: "native", desktop: "native", mobilePwa: "native", appliance: "unavailable" },
  { capabilityId: "local-backup", name: "Local Backup/Restore", web: "fallback", desktop: "native", mobilePwa: "unavailable", appliance: "native" },
  { capabilityId: "crash-reporting", name: "Crash Reporting", web: "fallback", desktop: "native", mobilePwa: "fallback", appliance: "fallback" },
  { capabilityId: "offline-mode", name: "Offline Mode", web: "fallback", desktop: "native", mobilePwa: "fallback", appliance: "native" },
  { capabilityId: "system-info", name: "System Information", web: "fallback", desktop: "native", mobilePwa: "fallback", appliance: "native" },
  { capabilityId: "tray-icon", name: "System Tray Icon", web: "unavailable", desktop: "native", mobilePwa: "unavailable", appliance: "unavailable" },
  { capabilityId: "menu-bar", name: "Native Menu Bar", web: "unavailable", desktop: "native", mobilePwa: "unavailable", appliance: "unavailable" },
  { capabilityId: "biometric-auth", name: "Biometric Authentication", web: "fallback", desktop: "unavailable", mobilePwa: "native", appliance: "unavailable" },
] as const;

export function getCapabilityMatrix(): readonly RuntimeCapabilityEntry[] {
  return RUNTIME_CAPABILITY_MATRIX;
}

export function getCapabilitiesForSurface(surface: RuntimeSurface): Array<{ id: string; name: string; status: CapabilityAvailability }> {
  return RUNTIME_CAPABILITY_MATRIX.map((c) => ({
    id: c.capabilityId,
    name: c.name,
    status: c[surface === "mobile-pwa" ? "mobilePwa" : surface],
  }));
}

export function getNativeCapabilities(surface: RuntimeSurface): RuntimeCapabilityEntry[] {
  const key = surface === "mobile-pwa" ? "mobilePwa" : surface;
  return RUNTIME_CAPABILITY_MATRIX.filter((c) => c[key] === "native");
}
