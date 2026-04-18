// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest helpers
// ═══════════════════════════════════════════════════════════════

import type { AppManifest, LaunchStrategy, AppType } from "./manifest-schema";

export type { AppManifest, LaunchStrategy, AppType };

export function isInternalApp(m: Pick<AppManifest, "app_type">) {
  return m.app_type === "internal";
}

export function isWebApp(m: Pick<AppManifest, "app_type">) {
  return m.app_type === "web";
}

export function isPwaApp(m: Pick<AppManifest, "app_type">) {
  return m.app_type === "pwa";
}

export function isExternalDesktopApp(m: Pick<AppManifest, "app_type">) {
  return m.app_type === "external_desktop";
}

export function manifestRequiresElectron(m: Pick<AppManifest, "launch_strategy">) {
  return m.launch_strategy === "native_binary" || m.launch_strategy === "electron_child_process";
}

export function preferredFallback(m: AppManifest): LaunchStrategy | null {
  const t = m.launch_target as { fallback?: LaunchStrategy };
  return t?.fallback ?? null;
}
