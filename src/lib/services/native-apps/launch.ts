// ═══════════════════════════════════════════════════════════════
// native-apps/launch — request a native-app launch via Electron bridge
// ═══════════════════════════════════════════════════════════════

import { getNativeAppEntry, isAllowlistedNativeApp } from "./registry";

export interface NativeLaunchOutcome {
  ok: boolean;
  appId: string;
  reason?: string;
  fallbackUrl?: string;
}

export async function launchNativeApp(appId: string): Promise<NativeLaunchOutcome> {
  if (!isAllowlistedNativeApp(appId)) {
    return { ok: false, appId, reason: "not_allowlisted" };
  }
  const entry = getNativeAppEntry(appId);
  const bridge = window.sitaApps;
  if (!bridge?.launchNativeApp) {
    return {
      ok: false,
      appId,
      reason: "Desktop host unavailable.",
      fallbackUrl: entry?.fallbackUrl,
    };
  }
  try {
    const r = await bridge.launchNativeApp(appId);
    return {
      ok: !!r?.ok,
      appId,
      reason: r?.reason,
      fallbackUrl: r?.fallbackUrl ?? entry?.fallbackUrl,
    };
  } catch (e) {
    return {
      ok: false,
      appId,
      reason: (e as Error).message,
      fallbackUrl: entry?.fallbackUrl,
    };
  }
}
