// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Runtime Detection
// Reliable detection of Electron host environment
// ═══════════════════════════════════════════════════════════════

export type DesktopPlatform = "win32" | "darwin" | "linux" | "unknown";

export interface DesktopRuntimeInfo {
  isElectron: boolean;
  platform: DesktopPlatform;
  bridgeAvailable: boolean;
  bridgeVersion: string | null;
}

/** Raw bridge accessor — returns the `window.electron` object or null */
export function getElectronBridge(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const el = (window as unknown as Record<string, unknown>).electron;
  return el && typeof el === "object" ? (el as Record<string, unknown>) : null;
}

/** Whether we are running inside an Electron renderer process */
export function isElectronRuntime(): boolean {
  return !!getElectronBridge();
}

/** Detailed runtime detection snapshot */
export function detectDesktopRuntime(): DesktopRuntimeInfo {
  const bridge = getElectronBridge();
  if (!bridge) {
    return { isElectron: false, platform: "unknown", bridgeAvailable: false, bridgeVersion: null };
  }

  const rawPlatform = typeof bridge.platform === "string" ? bridge.platform : "unknown";
  const platform: DesktopPlatform =
    rawPlatform === "win32" || rawPlatform === "darwin" || rawPlatform === "linux"
      ? rawPlatform
      : "unknown";

  return {
    isElectron: true,
    platform,
    bridgeAvailable: true,
    bridgeVersion: typeof bridge.getAppVersion === "function" ? "bridge-v1" : null,
  };
}

/** Check whether a specific bridge method is exposed */
export function hasBridgeMethod(method: string): boolean {
  const bridge = getElectronBridge();
  return !!bridge && typeof bridge[method] === "function";
}

/** Get the raw platform string from the bridge */
export function getDesktopPlatform(): DesktopPlatform {
  return detectDesktopRuntime().platform;
}
