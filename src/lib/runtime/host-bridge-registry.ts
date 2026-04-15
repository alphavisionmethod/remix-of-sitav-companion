// ═══════════════════════════════════════════════════════════════
// SITA OS — Host Bridge Registry
// Bridges: Electron IPC, Capacitor, PWA Service Worker
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget } from "./runtime-detection";

export type BridgeType = "electron-ipc" | "capacitor-bridge" | "service-worker" | "web-api" | "none";

export type BridgeStatus = "available" | "unavailable" | "initializing" | "error";

export interface HostBridgeEntry {
  bridgeId: string;
  bridgeType: BridgeType;
  /** Runtime target this bridge serves */
  target: RuntimeTarget;
  /** Display name */
  displayName: string;
  /** Capabilities exposed through this bridge */
  exposedCapabilities: string[];
  /** Whether the bridge requires initialization */
  requiresInit: boolean;
  /** Whether the bridge supports bidirectional communication */
  bidirectional: boolean;
  /** Latency class */
  latencyClass: "realtime" | "fast" | "standard" | "slow";
}

export const HOST_BRIDGES: HostBridgeEntry[] = [
  {
    bridgeId: "electron-main",
    bridgeType: "electron-ipc",
    target: "electron",
    displayName: "Electron Main Process Bridge",
    exposedCapabilities: ["file-system", "ipc-bridge", "system-tray", "biometric-auth", "push-notification"],
    requiresInit: true,
    bidirectional: true,
    latencyClass: "realtime",
  },
  {
    bridgeId: "capacitor-native",
    bridgeType: "capacitor-bridge",
    target: "capacitor",
    displayName: "Capacitor Native Bridge",
    exposedCapabilities: ["biometric-auth", "push-notification", "offline-storage", "background-sync"],
    requiresInit: true,
    bidirectional: true,
    latencyClass: "fast",
  },
  {
    bridgeId: "pwa-sw",
    bridgeType: "service-worker",
    target: "pwa",
    displayName: "PWA Service Worker",
    exposedCapabilities: ["offline-storage", "background-sync", "push-notification", "service-worker"],
    requiresInit: true,
    bidirectional: true,
    latencyClass: "fast",
  },
  {
    bridgeId: "web-standard",
    bridgeType: "web-api",
    target: "browser",
    displayName: "Web Standard APIs",
    exposedCapabilities: ["auth", "realtime-sync", "ai-inference", "proof-emission"],
    requiresInit: false,
    bidirectional: false,
    latencyClass: "standard",
  },
];

export function getBridgeForTarget(target: RuntimeTarget): HostBridgeEntry | undefined {
  return HOST_BRIDGES.find((b) => b.target === target);
}

export function getBridgeCapabilities(target: RuntimeTarget): string[] {
  return getBridgeForTarget(target)?.exposedCapabilities ?? [];
}

export function isBridgeBidirectional(target: RuntimeTarget): boolean {
  return getBridgeForTarget(target)?.bidirectional ?? false;
}
