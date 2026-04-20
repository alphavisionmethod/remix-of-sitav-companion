// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Surface Contract
// Typed contract for all 4 primary surfaces with explicit
// fallback and blocked feature declarations.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "./runtime-tier-model";
import type { PlatformSurface } from "./surface-types";

export type FeatureDisposition = "native" | "fallback" | "blocked" | "simulated" | "roadmap";

export interface SurfaceFeatureDeclaration {
  featureId: string;
  disposition: FeatureDisposition;
  fallbackDescription?: string;
  blockedReason?: string;
}

export interface RuntimeSurfaceContract {
  surface: PlatformSurface;
  tier: RuntimeTier;
  displayName: string;
  /** Capabilities natively available. */
  nativeFeatures: readonly string[];
  /** Capabilities available via fallback/degraded path. */
  fallbackFeatures: readonly string[];
  /** Hard-blocked — must NOT be attempted. */
  blockedFeatures: readonly string[];
  /** Simulated UX — not real capability. */
  simulatedFeatures: readonly string[];
  /** Planned but not yet implemented. */
  roadmapFeatures: readonly string[];
  /** Host authority level. */
  hostAuthority: "browser-sandbox" | "host-bridge" | "appliance-runtime" | "mobile-sandbox";
  /** Whether OS-level claims are honest on this surface. */
  honestOSAuthority: boolean;
}

export const RUNTIME_SURFACE_CONTRACTS: readonly RuntimeSurfaceContract[] = [
  {
    surface: "web",
    tier: "WEB_APP",
    displayName: "Web Browser",
    nativeFeatures: ["auth-email", "auth-google", "boardroom", "business-os", "money-os", "concierge", "files", "communications", "search", "command-palette", "approval-flows", "proof-receipts", "file-picker", "in-app-toast", "mobile-pwa-install", "session-restore", "connectors", "integration-oauth", "admin-dashboard", "kill-switches"],
    fallbackFeatures: ["biometric-auth", "filesystem-local", "local-backup", "crash-reporting", "offline-mode", "system-info", "notifications-native", "crash-reporter-ui"],
    blockedFeatures: ["window-control", "tray-icon", "auto-update-desktop", "ota-update", "appliance-recovery", "managed-runtime-services"],
    simulatedFeatures: ["desktop-shell", "dock", "lock-screen", "control-center", "mission-control", "app-launcher", "boot-sequence-ux", "ambient-widgets", "wallpaper", "menu-bar", "first-boot-ceremony", "nova-kernel-runtime", "nova-filesystem-runtime", "nova-compositor-runtime", "process-model-runtime", "trust-zones"],
    roadmapFeatures: [],
    hostAuthority: "browser-sandbox",
    honestOSAuthority: false,
  },
  {
    surface: "electron",
    tier: "DESKTOP_HOST",
    displayName: "Electron Desktop",
    nativeFeatures: ["auth-email", "auth-google", "boardroom", "business-os", "money-os", "concierge", "files", "communications", "search", "command-palette", "approval-flows", "proof-receipts", "filesystem-local", "file-picker", "local-backup", "crash-reporting", "offline-mode", "system-info", "notifications-push", "notifications-native", "in-app-toast", "window-control", "tray-icon", "menu-bar", "auto-update-desktop", "crash-reporter-ui", "session-restore", "connectors", "integration-oauth", "admin-dashboard", "kill-switches"],
    fallbackFeatures: ["biometric-auth"],
    blockedFeatures: ["ota-update", "appliance-recovery", "managed-runtime-services", "mobile-pwa-install"],
    simulatedFeatures: ["desktop-shell", "dock", "lock-screen", "control-center", "mission-control", "app-launcher", "boot-sequence-ux", "ambient-widgets", "wallpaper", "first-boot-ceremony", "nova-kernel-runtime", "nova-filesystem-runtime", "nova-compositor-runtime", "process-model-runtime", "trust-zones"],
    roadmapFeatures: [],
    hostAuthority: "host-bridge",
    honestOSAuthority: false,
  },
  {
    surface: "appliance",
    tier: "APPLIANCE_RUNTIME",
    displayName: "VMware/ISO Appliance",
    nativeFeatures: ["auth-email", "auth-google", "boardroom", "business-os", "money-os", "concierge", "files", "communications", "search", "command-palette", "approval-flows", "proof-receipts", "filesystem-local", "file-picker", "local-backup", "offline-mode", "system-info", "in-app-toast", "first-boot-ceremony", "ota-update", "appliance-recovery", "managed-runtime-services", "boot-sequence-ux", "trust-zones", "session-restore", "connectors", "integration-oauth", "admin-dashboard", "kill-switches"],
    fallbackFeatures: ["crash-reporting"],
    blockedFeatures: ["notifications-push", "notifications-native", "window-control", "tray-icon", "auto-update-desktop", "biometric-auth", "mobile-pwa-install"],
    simulatedFeatures: ["desktop-shell", "dock", "lock-screen", "control-center", "mission-control", "app-launcher", "ambient-widgets", "wallpaper", "menu-bar", "nova-kernel-runtime", "nova-filesystem-runtime", "nova-compositor-runtime", "process-model-runtime"],
    roadmapFeatures: [],
    hostAuthority: "appliance-runtime",
    honestOSAuthority: true,
  },
  {
    surface: "ios",
    tier: "WEB_APP",
    displayName: "iOS (PWA/Future Native)",
    nativeFeatures: ["auth-email", "auth-google", "boardroom", "business-os", "money-os", "concierge", "search", "command-palette", "in-app-toast", "biometric-auth", "session-restore"],
    fallbackFeatures: ["notifications-push", "offline-mode", "crash-reporting"],
    blockedFeatures: ["filesystem-local", "window-control", "tray-icon", "menu-bar", "auto-update-desktop", "ota-update", "appliance-recovery", "managed-runtime-services", "local-backup", "first-boot-ceremony"],
    simulatedFeatures: [],
    roadmapFeatures: ["files", "communications"],
    hostAuthority: "mobile-sandbox",
    honestOSAuthority: false,
  },
  {
    surface: "android",
    tier: "WEB_APP",
    displayName: "Android (PWA/Future Native)",
    nativeFeatures: ["auth-email", "auth-google", "boardroom", "business-os", "money-os", "concierge", "search", "command-palette", "in-app-toast", "biometric-auth", "session-restore"],
    fallbackFeatures: ["notifications-push", "offline-mode", "crash-reporting"],
    blockedFeatures: ["filesystem-local", "window-control", "tray-icon", "menu-bar", "auto-update-desktop", "ota-update", "appliance-recovery", "managed-runtime-services", "local-backup", "first-boot-ceremony"],
    simulatedFeatures: [],
    roadmapFeatures: ["files", "communications"],
    hostAuthority: "mobile-sandbox",
    honestOSAuthority: false,
  },
] as const;

export function getSurfaceContract(surface: PlatformSurface): RuntimeSurfaceContract {
  const c = RUNTIME_SURFACE_CONTRACTS.find((s) => s.surface === surface);
  if (!c) throw new Error(`[runtime-surface-contract] Unknown surface: ${surface}`);
  return c;
}

export function getFeatureDispositionOnSurface(featureId: string, surface: PlatformSurface): FeatureDisposition {
  const c = getSurfaceContract(surface);
  if (c.nativeFeatures.includes(featureId)) return "native";
  if (c.fallbackFeatures.includes(featureId)) return "fallback";
  if (c.simulatedFeatures.includes(featureId)) return "simulated";
  if (c.roadmapFeatures.includes(featureId)) return "roadmap";
  return "blocked";
}