// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Native Boot
// Idempotent boot that subscribes to native lifecycle + URL open
// events when Capacitor is present. Safe to call from PlatformInit
// in pure web mode (no-ops).
// ═══════════════════════════════════════════════════════════════

import { nativeAppLifecycle } from "../native/native-app-lifecycle";
import { resolveDeepLink } from "../navigation/mobile-deep-link-map";
import { recordMobileDiagnostic } from "../analytics/mobile-diagnostics";
import { envelopeMobileEvent } from "../analytics/mobile-analytics-partition";
import { lifecycleAnalyticsEvent } from "../analytics/lifecycle-analytics";
import { detectMobileRuntime } from "../runtime/mobile-runtime-detection";

let booted = false;
let cleanups: Array<() => void> = [];

const SESSION_ID = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function diag(event: string, props: Record<string, unknown>) {
  const probe = detectMobileRuntime();
  recordMobileDiagnostic(
    envelopeMobileEvent({
      os: probe.os,
      sessionId: SESSION_ID,
      event,
      properties: props,
    }),
  );
}

export async function bootMobileNative(opts: {
  onDeepLink?: (routePath: string) => void;
} = {}): Promise<void> {
  if (booted) return;
  booted = true;

  if (!nativeAppLifecycle.isAvailable()) {
    diag("native-boot.skipped", { reason: "capacitor-unavailable" });
    return;
  }

  const probe = detectMobileRuntime();

  const offState = await nativeAppLifecycle.subscribeStateChange((state) => {
    recordMobileDiagnostic(
      lifecycleAnalyticsEvent({
        os: probe.os,
        sessionId: SESSION_ID,
        from: state.isActive ? "background" : "foreground",
        to: state.isActive ? "foreground" : "background",
        reason: "appStateChange",
      }),
    );
  });
  cleanups.push(offState);

  const offUrl = await nativeAppLifecycle.subscribeUrlOpen(({ url }) => {
    const res = resolveDeepLink(url);
    if (!res) {
      diag("deep-link.unresolved", { url });
      return;
    }
    diag("deep-link.resolved", { url, key: res.key, route: res.routePath });
    opts.onDeepLink?.(res.routePath);
  });
  cleanups.push(offUrl);

  diag("native-boot.ready", { os: probe.os, host: probe.host });
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
