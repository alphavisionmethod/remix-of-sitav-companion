// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch resolver
// Pure function that decides HOW an app launches given runtime ctx.
// ═══════════════════════════════════════════════════════════════

import type { AppManifest, LaunchStrategy } from "./manifest-schema";
import type { RuntimeCapabilities } from "./runtime";
import { deriveInstallStatus, isLaunchable, type InstalledAppRow } from "./install-state";

export type LaunchInstructionKind =
  | "internal_route"
  | "embedded_webview"
  | "external_browser"
  | "pwa_window"
  | "native_binary"
  | "deep_link"
  | "blocked";

export interface LaunchInstruction {
  kind: LaunchInstructionKind;
  appId: string;
  /** route for internal apps */
  route?: string;
  /** target URL for web/pwa/external_browser */
  url?: string;
  /** native binary descriptor for electron */
  nativeTarget?: { darwin?: string; win32?: string; linux?: string; args?: string[] };
  /** window defaults */
  window?: { width?: number; height?: number };
  /** the strategy actually applied (after fallbacks) */
  appliedStrategy: LaunchStrategy | "blocked";
  /** explanation if we degraded or blocked */
  degradedReason?: string;
  /** suggested fallback CTA when blocked (e.g. open web version) */
  suggestedAction?: { label: string; kind: LaunchInstructionKind; url?: string };
  /** true if this requires the desktop host */
  requiresDesktop: boolean;
}

export interface LaunchContext {
  runtime: RuntimeCapabilities;
  isAuthenticated: boolean;
  installed?: InstalledAppRow;
}

function targetUrl(m: AppManifest): string | undefined {
  const t = m.launch_target as { url?: string };
  return t?.url;
}

function fallbackUrl(m: AppManifest): string | undefined {
  const t = m.launch_target as { fallback_url?: string; url?: string };
  return t?.fallback_url ?? t?.url;
}

function nativeTarget(m: AppManifest) {
  const t = m.launch_target as {
    darwin?: string;
    win32?: string;
    linux?: string;
    args?: string[];
  };
  return { darwin: t.darwin, win32: t.win32, linux: t.linux, args: t.args };
}

export function resolveLaunch(m: AppManifest, ctx: LaunchContext): LaunchInstruction {
  const status = deriveInstallStatus(
    { app_id: m.app_id, latest_version: m.latest_version, installability: m.installability },
    ctx.installed,
  );

  // Auth gate
  if (m.requires_auth && !ctx.isAuthenticated) {
    return {
      kind: "blocked",
      appId: m.app_id,
      appliedStrategy: "blocked",
      degradedReason: "Sign in required to launch this app.",
      requiresDesktop: false,
    };
  }

  // Install gate (preinstalled internal apps always launchable)
  if (m.installability !== "preinstalled" && !isLaunchable(status)) {
    return {
      kind: "blocked",
      appId: m.app_id,
      appliedStrategy: "blocked",
      degradedReason: "App is not installed.",
      requiresDesktop: false,
    };
  }

  // Internal route — always works
  if (m.launch_strategy === "internal_route") {
    const t = m.launch_target as { route?: string };
    return {
      kind: "internal_route",
      appId: m.app_id,
      route: t.route,
      appliedStrategy: "internal_route",
      window: m.window_defaults,
      requiresDesktop: false,
    };
  }

  // Native binary — requires Electron + bridge
  if (m.launch_strategy === "native_binary" || m.launch_strategy === "electron_child_process") {
    if (ctx.runtime.isElectron && ctx.runtime.hasNativeAppsBridge) {
      return {
        kind: "native_binary",
        appId: m.app_id,
        nativeTarget: nativeTarget(m),
        appliedStrategy: m.launch_strategy,
        requiresDesktop: true,
      };
    }
    // Browser-only: degrade honestly
    const fb = fallbackUrl(m);
    return {
      kind: "blocked",
      appId: m.app_id,
      appliedStrategy: "blocked",
      degradedReason: "Desktop only — native app unavailable in browser.",
      suggestedAction: fb
        ? { label: "Open web version", kind: "external_browser", url: fb }
        : undefined,
      requiresDesktop: true,
    };
  }

  // PWA window — try standalone, fall back to embedded or external
  if (m.launch_strategy === "pwa_window") {
    const url = targetUrl(m);
    if (!url) {
      return {
        kind: "blocked",
        appId: m.app_id,
        appliedStrategy: "blocked",
        degradedReason: "PWA URL missing.",
        requiresDesktop: false,
      };
    }
    if (ctx.runtime.isElectron) {
      return {
        kind: "pwa_window",
        appId: m.app_id,
        url,
        appliedStrategy: "pwa_window",
        window: m.window_defaults,
        requiresDesktop: false,
      };
    }
    // Browser: open in embedded shell window if available, else external
    return {
      kind: "embedded_webview",
      appId: m.app_id,
      url,
      appliedStrategy: "embedded_webview",
      window: m.window_defaults,
      degradedReason: "PWA standalone not supported here — opened embedded.",
      requiresDesktop: false,
    };
  }

  // Embedded webview — preferred for web apps inside shell
  if (m.launch_strategy === "embedded_webview") {
    const url = targetUrl(m);
    if (!url) {
      return {
        kind: "blocked",
        appId: m.app_id,
        appliedStrategy: "blocked",
        degradedReason: "App URL missing.",
        requiresDesktop: false,
      };
    }
    return {
      kind: "embedded_webview",
      appId: m.app_id,
      url,
      appliedStrategy: "embedded_webview",
      window: m.window_defaults,
      requiresDesktop: false,
    };
  }

  if (m.launch_strategy === "external_browser") {
    const url = targetUrl(m);
    if (!url) {
      return {
        kind: "blocked",
        appId: m.app_id,
        appliedStrategy: "blocked",
        degradedReason: "App URL missing.",
        requiresDesktop: false,
      };
    }
    return {
      kind: "external_browser",
      appId: m.app_id,
      url,
      appliedStrategy: "external_browser",
      requiresDesktop: false,
    };
  }

  if (m.launch_strategy === "deep_link") {
    const t = m.launch_target as { protocol?: string; url?: string };
    return {
      kind: "deep_link",
      appId: m.app_id,
      url: t.url ?? `${t.protocol ?? "sita"}://`,
      appliedStrategy: "deep_link",
      requiresDesktop: false,
    };
  }

  return {
    kind: "blocked",
    appId: m.app_id,
    appliedStrategy: "blocked",
    degradedReason: "No launch strategy resolved.",
    requiresDesktop: false,
  };
}
