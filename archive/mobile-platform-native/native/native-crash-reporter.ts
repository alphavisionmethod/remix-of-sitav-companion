/**
 * SITA OS — Native crash reporter
 *
 * Initializes Sentry-Capacitor on iOS/Android and falls back to the web
 * Sentry SDK on browsers. Honors VITE_SENTRY_DSN; no-op when unset so
 * dev builds never spam telemetry.
 *
 * Wired from src/main.tsx after the existing initSentry() call.
 */

import * as SentryReact from "@sentry/react";
import { isCapacitorAvailable, getCapacitorPlatform } from "./capacitor-bridge";

let initialized = false;

export async function initNativeCrashReporter(): Promise<{
  ok: boolean;
  transport: "capacitor" | "web" | "none";
  reason?: string;
}> {
  if (initialized) return { ok: true, transport: "web" };

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) {
    return { ok: false, transport: "none", reason: "no_dsn_configured" };
  }

  const release =
    (import.meta.env.VITE_SENTRY_RELEASE as string | undefined) ??
    `sita-os@${import.meta.env.VITE_APP_VERSION ?? "dev"}`;
  const environment =
    (import.meta.env.VITE_SENTRY_ENV as string | undefined) ??
    (import.meta.env.MODE === "production" ? "production" : "development");

  // Native path
  if (isCapacitorAvailable()) {
    try {
      const { init: initCap } = await import("@sentry/capacitor");
      initCap(
        {
          dsn,
          release,
          environment,
          tracesSampleRate: 0.1,
          attachStacktrace: true,
          dist: getCapacitorPlatform() ?? "native",
        },
        SentryReact.init,
      );
      initialized = true;
      return { ok: true, transport: "capacitor" };
    } catch (e) {
      console.warn("[crash-reporter] capacitor init failed, falling back to web:", e);
    }
  }

  // Web fallback
  SentryReact.init({
    dsn,
    release,
    environment,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
  });
  initialized = true;
  return { ok: true, transport: "web" };
}

export function captureNativeException(error: unknown, context?: Record<string, unknown>) {
  if (!initialized) return;
  SentryReact.captureException(error, { extra: context });
}
