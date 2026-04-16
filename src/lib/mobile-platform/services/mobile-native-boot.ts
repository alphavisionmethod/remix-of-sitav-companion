// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Native Boot
// Idempotent boot that subscribes to native lifecycle + URL open
// events when Capacitor is present. Safe to call from PlatformInit
// in pure web mode (no-ops).
// ═══════════════════════════════════════════════════════════════

import { nativeAppLifecycle } from "../native/native-app-lifecycle";
import { resolveDeepLink } from "../navigation/mobile-deep-link-map";
import { recordMobileDiagnostic } from "../analytics/mobile-diagnostics";
import { lifecycleAnalyticsEvent } from "../analytics/lifecycle-analytics";

let booted = false;
let cleanups: Array<() => void> = [];

export async function bootMobileNative(opts: {
  onDeepLink?: (routePath: string) => void;
} = {}): Promise<void> {
  if (booted) return;
  booted = true;

  if (!nativeAppLifecycle.isAvailable()) {
    recordMobileDiagnostic({
      kind: "info",
      area: "native-boot",
      message: "Capacitor App plugin unavailable — running web fallback.",
    });
    return;
  }

  const offState = await nativeAppLifecycle.subscribeStateChange((state) => {
    lifecycleAnalyticsEvent({
      phaseFrom: state.isActive ? "background" : "foreground",
      phaseTo: state.isActive ? "foreground" : "background",
      reason: "appStateChange",
    });
  });
  cleanups.push(offState);

  const offUrl = await nativeAppLifecycle.subscribeUrlOpen(({ url }) => {
    const res = resolveDeepLink(url);
    if (!res) {
      recordMobileDiagnostic({
        kind: "warn",
        area: "deep-link",
        message: `Unresolved deep-link: ${url}`,
      });
      return;
    }
    opts.onDeepLink?.(res.routePath);
  });
  cleanups.push(offUrl);

  recordMobileDiagnostic({
    kind: "info",
    area: "native-boot",
    message: "Mobile native bridge wired (Capacitor App).",
  });
}

export function isMobileNativeBooted() {
  return booted;
}

export function teardownMobileNative() {
  cleanups.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
  cleanups = [];
  booted = false;
}
