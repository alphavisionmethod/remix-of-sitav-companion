// ═══════════════════════════════════════════════════════════════
// SITA OS — Web Capability Map
// Per-capability availability under the WEB_APP tier.
// ═══════════════════════════════════════════════════════════════

import type { TierAvailability } from "../runtime-tier-model";

export interface WebCapabilityEntry {
  capabilityId: string;
  availability: TierAvailability;
  /** Path to the user-visible fallback when applicable. */
  fallbackHandlerHint?: string;
  notes?: string;
}

export const WEB_CAPABILITY_MAP: readonly WebCapabilityEntry[] = [
  { capabilityId: "auth", availability: "supported" },
  { capabilityId: "data-persistence", availability: "supported" },
  { capabilityId: "realtime", availability: "supported" },
  { capabilityId: "ai-inference", availability: "supported" },
  { capabilityId: "deep-linking", availability: "supported" },
  { capabilityId: "notifications-push", availability: "supported", notes: "VAPID web push only" },
  { capabilityId: "notifications-native", availability: "fallback", fallbackHandlerHint: "in-app-toast" },
  { capabilityId: "filesystem-local", availability: "fallback", fallbackHandlerHint: "browser-upload-picker" },
  { capabilityId: "local-backup", availability: "fallback", fallbackHandlerHint: "download-upload-roundtrip" },
  { capabilityId: "auto-update", availability: "supported", notes: "Service-worker driven" },
  { capabilityId: "window-control", availability: "prohibited" },
  { capabilityId: "tray-icon", availability: "prohibited" },
  { capabilityId: "menu-bar", availability: "prohibited" },
  { capabilityId: "crash-reporting", availability: "fallback" },
  { capabilityId: "offline-mode", availability: "fallback", fallbackHandlerHint: "service-worker" },
  { capabilityId: "system-info", availability: "fallback" },
  { capabilityId: "biometric-auth", availability: "fallback", notes: "WebAuthn passkey" },
] as const;

export function getWebCapability(capabilityId: string): WebCapabilityEntry | undefined {
  return WEB_CAPABILITY_MAP.find((c) => c.capabilityId === capabilityId);
}
