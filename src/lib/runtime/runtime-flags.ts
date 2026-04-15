// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Flags
// Typed runtime behavior switches (not feature flags)
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget, RuntimeEnvironment } from "./runtime-detection";

/**
 * Runtime flags control low-level runtime behavior
 * (e.g., proof emission, sync strategy, offline mode).
 * These are NOT product feature flags.
 */
export interface RuntimeFlags {
  /** Emit proof receipts for all orchestration actions */
  proofEmissionEnabled: boolean;

  /** Enable offline queue for commands */
  offlineQueueEnabled: boolean;

  /** Enable real-time sync via WebSocket */
  realtimeSyncEnabled: boolean;

  /** Enable service worker caching */
  serviceWorkerCachingEnabled: boolean;

  /** Enable IPC bridge (Electron/Capacitor) */
  ipcBridgeEnabled: boolean;

  /** Enable verbose runtime logging */
  verboseRuntimeLogging: boolean;

  /** Enable AI inference (false in offline/restricted modes) */
  aiInferenceEnabled: boolean;

  /** Enable telemetry collection */
  telemetryEnabled: boolean;

  /** Enable crash dump collection */
  crashReportingEnabled: boolean;

  /** Enable background sync workers */
  backgroundSyncEnabled: boolean;

  /** Maximum concurrent orchestration commands */
  maxConcurrentCommands: number;

  /** Command timeout in milliseconds */
  commandTimeoutMs: number;
}

/**
 * Resolve runtime flags based on target and environment.
 */
export function resolveRuntimeFlags(
  target: RuntimeTarget,
  environment: RuntimeEnvironment
): RuntimeFlags {
  const isProd = environment === "production";
  const isElectron = target === "electron";
  const isMobile = target === "capacitor";

  return {
    proofEmissionEnabled: isProd,
    offlineQueueEnabled: isElectron || isMobile,
    realtimeSyncEnabled: target !== "node" && target !== "docker",
    serviceWorkerCachingEnabled: target === "browser" || target === "pwa",
    ipcBridgeEnabled: isElectron,
    verboseRuntimeLogging: !isProd,
    aiInferenceEnabled: true,
    telemetryEnabled: isProd,
    crashReportingEnabled: isProd || environment === "staging",
    backgroundSyncEnabled: isElectron || isMobile || target === "pwa",
    maxConcurrentCommands: isElectron ? 10 : 5,
    commandTimeoutMs: isProd ? 30_000 : 60_000,
  };
}
