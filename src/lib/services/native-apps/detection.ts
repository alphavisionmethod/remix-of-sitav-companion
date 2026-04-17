// ═══════════════════════════════════════════════════════════════
// native-apps/detection — check if a native app is available
// ═══════════════════════════════════════════════════════════════

import { isAllowlistedNativeApp } from "./registry";

export interface NativeAppAvailability {
  available: boolean;
  appId: string;
  reason?: string;
}

export async function checkNativeAppAvailability(
  appId: string,
): Promise<NativeAppAvailability> {
  if (!isAllowlistedNativeApp(appId)) {
    return { available: false, appId, reason: "not_allowlisted" };
  }
  const bridge = window.sitaApps;
  if (!bridge?.checkNativeAppAvailability) {
    return { available: false, appId, reason: "no_desktop_host" };
  }
  try {
    return await bridge.checkNativeAppAvailability(appId);
  } catch (e) {
    return { available: false, appId, reason: (e as Error).message };
  }
}

export function isDesktopHost(): boolean {
  return !!window.sitaApps?.launchNativeApp;
}
