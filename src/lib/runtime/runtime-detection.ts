// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Detection
// Extends surface-detection with full RuntimeTarget classification
// ═══════════════════════════════════════════════════════════════

import { detectSurfaceType, type ExtendedSurfaceType } from "@/lib/services/surface-detection";

/**
 * All possible runtime execution targets across SITA OS deployments.
 */
export type RuntimeTarget =
  | "browser"
  | "electron"
  | "capacitor"
  | "pwa"
  | "node"
  | "deno"
  | "docker";

export type RuntimeEnvironment = "production" | "staging" | "development" | "test" | "ci";

export interface RuntimeDetectionResult {
  target: RuntimeTarget;
  environment: RuntimeEnvironment;
  surfaceType: ExtendedSurfaceType;
  isServer: boolean;
  isClient: boolean;
  isHybrid: boolean;
  hasNativeAccess: boolean;
  hasFileSystemAccess: boolean;
  hasIPC: boolean;
  supportsServiceWorker: boolean;
  supportsWebSocket: boolean;
  userAgent: string | null;
}

function mapSurfaceToTarget(surface: ExtendedSurfaceType): RuntimeTarget {
  switch (surface) {
    case "electron": return "electron";
    case "capacitor": return "capacitor";
    case "pwa": return "pwa";
    default: return "browser";
  }
}

function detectEnvironment(): RuntimeEnvironment {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.MODE === "test") return "test";
    if (import.meta.env.MODE === "production") return "production";
    if (import.meta.env.MODE === "staging") return "staging";
  }
  return "development";
}

/**
 * Detect the full runtime context — extends surface-detection
 * with target classification, environment, and capability flags.
 */
export function detectRuntime(): RuntimeDetectionResult {
  const surfaceType = detectSurfaceType();
  const target = mapSurfaceToTarget(surfaceType);
  const environment = detectEnvironment();
  const isClient = typeof window !== "undefined";
  const isServer = !isClient;

  return {
    target,
    environment,
    surfaceType,
    isServer,
    isClient,
    isHybrid: target === "electron" || target === "capacitor",
    hasNativeAccess: target === "electron" || target === "capacitor",
    hasFileSystemAccess: target === "electron" || isServer,
    hasIPC: target === "electron",
    supportsServiceWorker: isClient && "serviceWorker" in navigator,
    supportsWebSocket: isClient && typeof WebSocket !== "undefined",
    userAgent: isClient ? navigator.userAgent : null,
  };
}

/** Cache singleton — runtime target doesn't change mid-session */
let _cached: RuntimeDetectionResult | null = null;

export function getCachedRuntime(): RuntimeDetectionResult {
  if (!_cached) _cached = detectRuntime();
  return _cached;
}

export function resetRuntimeCache(): void {
  _cached = null;
}
