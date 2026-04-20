// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Runtime Compatibility
// Maps window features to runtime tiers.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeSurface } from "@/packages/window-contracts";

export type WindowFeature =
  | "drag" | "snap" | "multi-monitor" | "dpi-scaling"
  | "native-bridge" | "ipc" | "crash-recovery"
  | "session-persistence" | "performance-monitoring"
  | "always-on-top" | "frameless" | "tray-minimize";

type SupportLevel = "full" | "partial" | "degraded" | "none";

const MATRIX: Record<WindowFeature, Record<RuntimeSurface, SupportLevel>> = {
  "drag":                  { web: "full", pwa: "full", desktop: "full", appliance: "partial" },
  "snap":                  { web: "full", pwa: "full", desktop: "full", appliance: "none" },
  "multi-monitor":         { web: "none", pwa: "none", desktop: "full", appliance: "none" },
  "dpi-scaling":           { web: "partial", pwa: "partial", desktop: "full", appliance: "partial" },
  "native-bridge":         { web: "none", pwa: "none", desktop: "full", appliance: "full" },
  "ipc":                   { web: "partial", pwa: "partial", desktop: "full", appliance: "full" },
  "crash-recovery":        { web: "partial", pwa: "partial", desktop: "full", appliance: "full" },
  "session-persistence":   { web: "full", pwa: "full", desktop: "full", appliance: "degraded" },
  "performance-monitoring":{ web: "partial", pwa: "partial", desktop: "full", appliance: "partial" },
  "always-on-top":         { web: "none", pwa: "none", desktop: "full", appliance: "none" },
  "frameless":             { web: "none", pwa: "none", desktop: "full", appliance: "none" },
  "tray-minimize":         { web: "none", pwa: "none", desktop: "full", appliance: "none" },
};

export function isFeatureAvailable(feature: WindowFeature, tier: RuntimeSurface): boolean {
  const level = MATRIX[feature]?.[tier] ?? "none";
  return level === "full" || level === "partial";
}

export function getFeatureSupportLevel(feature: WindowFeature, tier: RuntimeSurface): SupportLevel {
  return MATRIX[feature]?.[tier] ?? "none";
}

export function getDegradedBehavior(feature: WindowFeature, tier: RuntimeSurface): string {
  const level = MATRIX[feature]?.[tier] ?? "none";
  if (level === "full") return "No degradation";
  if (level === "partial") return `${feature} has limited capability on ${tier}`;
  if (level === "degraded") return `${feature} uses fallback behavior on ${tier}`;
  return `${feature} is unavailable on ${tier}`;
}

export function getCompatibilityMatrix(): Record<WindowFeature, Record<RuntimeSurface, SupportLevel>> {
  return { ...MATRIX };
}