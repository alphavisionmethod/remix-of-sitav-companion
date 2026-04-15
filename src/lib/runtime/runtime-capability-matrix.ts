// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Capability Matrix
// What capabilities exist per runtime target
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget } from "./runtime-detection";

export interface RuntimeCapabilityEntry {
  capabilityId: string;
  name: string;
  description: string;
  /** Which targets support this capability */
  supportedTargets: RuntimeTarget[];
  /** Whether the capability requires network */
  requiresNetwork: boolean;
  /** Whether the capability requires native access */
  requiresNative: boolean;
  /** Fallback behavior when unavailable */
  fallback: "degrade" | "refuse" | "queue" | "simulate";
}

/**
 * Canonical capability matrix — every runtime capability with its target support.
 */
export const RUNTIME_CAPABILITIES: RuntimeCapabilityEntry[] = [
  // ── Core ──
  { capabilityId: "auth", name: "Authentication", description: "User sign-in and session management", supportedTargets: ["browser", "electron", "capacitor", "pwa"], requiresNetwork: true, requiresNative: false, fallback: "refuse" },
  { capabilityId: "offline-storage", name: "Offline Storage", description: "Local-first data persistence", supportedTargets: ["browser", "electron", "capacitor", "pwa"], requiresNetwork: false, requiresNative: false, fallback: "degrade" },
  { capabilityId: "realtime-sync", name: "Realtime Sync", description: "WebSocket-based real-time data sync", supportedTargets: ["browser", "electron", "capacitor", "pwa"], requiresNetwork: true, requiresNative: false, fallback: "queue" },
  { capabilityId: "ai-inference", name: "AI Inference", description: "AI model invocation via gateway", supportedTargets: ["browser", "electron", "capacitor", "pwa", "node", "deno"], requiresNetwork: true, requiresNative: false, fallback: "queue" },
  { capabilityId: "proof-emission", name: "Proof Emission", description: "Generate cryptographic proof receipts", supportedTargets: ["browser", "electron", "capacitor", "pwa", "node", "deno", "docker"], requiresNetwork: false, requiresNative: false, fallback: "queue" },

  // ── Native ──
  { capabilityId: "file-system", name: "File System Access", description: "Direct file system read/write", supportedTargets: ["electron", "node", "deno", "docker"], requiresNetwork: false, requiresNative: true, fallback: "refuse" },
  { capabilityId: "ipc-bridge", name: "IPC Bridge", description: "Inter-process communication", supportedTargets: ["electron"], requiresNetwork: false, requiresNative: true, fallback: "refuse" },
  { capabilityId: "system-tray", name: "System Tray", description: "OS system tray integration", supportedTargets: ["electron"], requiresNetwork: false, requiresNative: true, fallback: "degrade" },
  { capabilityId: "push-notification", name: "Push Notifications", description: "VAPID/FCM push notifications", supportedTargets: ["browser", "pwa", "capacitor"], requiresNetwork: true, requiresNative: false, fallback: "degrade" },
  { capabilityId: "biometric-auth", name: "Biometric Auth", description: "Fingerprint/FaceID authentication", supportedTargets: ["capacitor", "electron"], requiresNetwork: false, requiresNative: true, fallback: "degrade" },

  // ── Background ──
  { capabilityId: "background-sync", name: "Background Sync", description: "Background data synchronization", supportedTargets: ["pwa", "electron", "capacitor"], requiresNetwork: true, requiresNative: false, fallback: "queue" },
  { capabilityId: "service-worker", name: "Service Worker", description: "Service worker for caching and offline", supportedTargets: ["browser", "pwa"], requiresNetwork: false, requiresNative: false, fallback: "degrade" },
];

/**
 * Get capabilities available for a given runtime target.
 */
export function getCapabilitiesForTarget(target: RuntimeTarget): RuntimeCapabilityEntry[] {
  return RUNTIME_CAPABILITIES.filter((c) => c.supportedTargets.includes(target));
}

/**
 * Check if a specific capability is supported on a target.
 */
export function isCapabilitySupported(capabilityId: string, target: RuntimeTarget): boolean {
  const cap = RUNTIME_CAPABILITIES.find((c) => c.capabilityId === capabilityId);
  return cap ? cap.supportedTargets.includes(target) : false;
}

/**
 * Get the fallback strategy for a capability on an unsupported target.
 */
export function getCapabilityFallback(capabilityId: string): RuntimeCapabilityEntry["fallback"] | undefined {
  return RUNTIME_CAPABILITIES.find((c) => c.capabilityId === capabilityId)?.fallback;
}
