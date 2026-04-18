// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Capability Matrix
// Cross-runtime capability matrix (web/desktop/mobile-pwa/appliance)
//
// Phase 2 Meta-Architecture: this hardware-capability matrix now
// also exposes an 8-surface projection via projectToCanonicalSurface()
// for use by the feature-capability-registry and admin explorers.
// The original 4-surface API is preserved for back-compat.
// ═══════════════════════════════════════════════════════════════

import type { CanonicalSurface } from "./surface-types";

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

// ── 8-Surface Projection (Phase 2) ──────────────────────────────
// Project the 4-surface hardware matrix onto the canonical 8-surface
// model. ios/android both inherit mobilePwa; offline/demo/real default
// to the platform baseline (overlays handled by feature-capability-registry).

export function projectToCanonicalSurface(
  entry: RuntimeCapabilityEntry,
  surface: CanonicalSurface,
): CapabilityAvailability {
  switch (surface) {
    case "web":       return entry.web;
    case "electron":  return entry.desktop;
    case "appliance": return entry.appliance;
    case "ios":
    case "android":   return entry.mobilePwa;
    // Mode overlays — capability follows the active platform; the
    // mode dimension is enforced by feature-capability-registry.
    case "offline":
    case "demo":
    case "real":      return entry.web;
  }
}

export function getCanonicalCapabilityRow(
  capabilityId: string,
): Record<CanonicalSurface, CapabilityAvailability> | null {
  const entry = RUNTIME_CAPABILITY_MATRIX.find((e) => e.capabilityId === capabilityId);
  if (!entry) return null;
  return {
    web:       projectToCanonicalSurface(entry, "web"),
    electron:  projectToCanonicalSurface(entry, "electron"),
    appliance: projectToCanonicalSurface(entry, "appliance"),
    ios:       projectToCanonicalSurface(entry, "ios"),
    android:   projectToCanonicalSurface(entry, "android"),
    offline:   projectToCanonicalSurface(entry, "offline"),
    demo:      projectToCanonicalSurface(entry, "demo"),
    real:      projectToCanonicalSurface(entry, "real"),
  };
}
