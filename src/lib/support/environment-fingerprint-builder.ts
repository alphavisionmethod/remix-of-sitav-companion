// ═══════════════════════════════════════════════════════════════
// SITA OS — Environment Fingerprint Builder
// Captures safe, non-sensitive operational context for support.
// ═══════════════════════════════════════════════════════════════

import type { BundlePack } from "./support-bundle-contract";

export interface EnvironmentFingerprint {
  readonly runtimeSurface: string;
  readonly appVersion: string;
  readonly buildHash: string | null;
  readonly deploymentProfile: string;
  readonly featureFlags: Record<string, boolean>;
  readonly integrationSummaries: Record<string, string>;
  readonly browserInfo: BrowserInfo | null;
  readonly routeContext: string | null;
  readonly tenantContext: string | null;
  readonly locale: string;
  readonly timezone: string;
  readonly capturedAt: string;
}

interface BrowserInfo {
  readonly userAgent: string;
  readonly platform: string;
  readonly language: string;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly devicePixelRatio: number;
  readonly online: boolean;
}

function captureBrowserInfo(): BrowserInfo | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen?.width ?? 0,
    screenHeight: window.screen?.height ?? 0,
    devicePixelRatio: window.devicePixelRatio ?? 1,
    online: navigator.onLine,
  };
}

function detectRuntimeSurface(): string {
  if (typeof window === "undefined") return "server";
  if ("electron" in window || navigator.userAgent.includes("Electron")) return "electron";
  if (/Mobi|Android/i.test(navigator.userAgent)) return "mobile-web";
  return "web";
}

/**
 * Build an environment fingerprint pack.
 * All data is non-sensitive by design.
 */
export function buildEnvironmentFingerprint(options: {
  appVersion?: string;
  buildHash?: string | null;
  deploymentProfile?: string;
  featureFlags?: Record<string, boolean>;
  integrationSummaries?: Record<string, string>;
  routeContext?: string | null;
  tenantContext?: string | null;
}): EnvironmentFingerprint {
  return {
    runtimeSurface: detectRuntimeSurface(),
    appVersion: options.appVersion ?? "unknown",
    buildHash: options.buildHash ?? null,
    deploymentProfile: options.deploymentProfile ?? "unknown",
    featureFlags: options.featureFlags ?? {},
    integrationSummaries: options.integrationSummaries ?? {},
    browserInfo: captureBrowserInfo(),
    routeContext: options.routeContext ?? (typeof window !== "undefined" ? window.location?.pathname ?? null : null),
    tenantContext: options.tenantContext ?? null,
    locale: typeof navigator !== "undefined" ? navigator.language : "unknown",
    timezone: Intl?.DateTimeFormat?.().resolvedOptions?.()?.timeZone ?? "unknown",
    capturedAt: new Date().toISOString(),
  };
}

/** Convert an environment fingerprint into a BundlePack. */
export function toFingerprintPack(fp: EnvironmentFingerprint): BundlePack {
  return {
    packType: "environment-fingerprint",
    capturedAt: fp.capturedAt,
    data: fp as unknown as Record<string, unknown>,
    redactedFields: [],
  };
}