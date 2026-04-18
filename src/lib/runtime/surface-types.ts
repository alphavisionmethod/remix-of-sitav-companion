// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Surface Type Registry
// 8 first-class runtime surfaces (Phase 2 of Meta-Architecture)
//
// Surfaces extend the 4-tier runtime model with explicit
// platform/mode dimensions used for capability gating, launch
// honesty enforcement, and parity reporting.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "./runtime-tier-model";

/** Canonical platform surface identifiers. */
export type PlatformSurface =
  | "web"          // Browser-first web app (Tier 1)
  | "electron"     // Native desktop host (Tier 2)
  | "appliance"    // VMware / OVA / ISO appliance (Tier 3)
  | "ios"          // iOS native / PWA (Tier 4 → Tier 1 base)
  | "android";     // Android native / PWA (Tier 4 → Tier 1 base)

/** Operational mode dimension that overlays every surface. */
export type SurfaceMode =
  | "real"         // Live backend, real data
  | "demo"         // Curated demo data, no real side-effects
  | "offline";     // Network-degraded; offline-first cache only

/** Canonical 8-surface enum used by the capability registry. */
export type CanonicalSurface =
  | "web"
  | "electron"
  | "appliance"
  | "ios"
  | "android"
  | "offline"
  | "demo"
  | "real";

export const CANONICAL_SURFACES: readonly CanonicalSurface[] = [
  "web",
  "electron",
  "appliance",
  "ios",
  "android",
  "offline",
  "demo",
  "real",
] as const;

export const PLATFORM_SURFACES: readonly PlatformSurface[] = [
  "web",
  "electron",
  "appliance",
  "ios",
  "android",
] as const;

export const SURFACE_MODES: readonly SurfaceMode[] = [
  "real",
  "demo",
  "offline",
] as const;

/** Map a platform surface to its underlying runtime tier. */
export function getRuntimeTierForSurface(surface: PlatformSurface): RuntimeTier {
  switch (surface) {
    case "appliance":
      return "APPLIANCE_RUNTIME";
    case "electron":
      return "DESKTOP_HOST";
    case "web":
    case "ios":
    case "android":
      return "WEB_APP";
  }
}

/** Surface metadata for explorer/admin views. */
export interface SurfaceMetadata {
  surface: CanonicalSurface;
  label: string;
  category: "platform" | "mode";
  hostAuthority: "browser-sandbox" | "host-bridge" | "appliance-runtime" | "mobile-sandbox" | "mode-overlay";
  description: string;
}

export const SURFACE_METADATA: readonly SurfaceMetadata[] = [
  { surface: "web",       label: "Web Browser",     category: "platform", hostAuthority: "browser-sandbox",   description: "Standard desktop/laptop browser surface." },
  { surface: "electron",  label: "Electron Desktop", category: "platform", hostAuthority: "host-bridge",      description: "Native desktop wrapper with preload bridge." },
  { surface: "appliance", label: "VMware Appliance", category: "platform", hostAuthority: "appliance-runtime", description: "Packaged ISO/OVA appliance image." },
  { surface: "ios",       label: "iOS",              category: "platform", hostAuthority: "mobile-sandbox",   description: "iOS native app or installed PWA." },
  { surface: "android",   label: "Android",          category: "platform", hostAuthority: "mobile-sandbox",   description: "Android native app or installed PWA." },
  { surface: "offline",   label: "Offline Mode",     category: "mode",     hostAuthority: "mode-overlay",     description: "Network-degraded mode overlaying any platform." },
  { surface: "demo",      label: "Demo Mode",        category: "mode",     hostAuthority: "mode-overlay",     description: "Curated demo data; side-effects disabled." },
  { surface: "real",      label: "Real Mode",        category: "mode",     hostAuthority: "mode-overlay",     description: "Live mode with real backend writes." },
] as const;

export function getSurfaceMetadata(surface: CanonicalSurface): SurfaceMetadata {
  const m = SURFACE_METADATA.find((s) => s.surface === surface);
  if (!m) throw new Error(`[surface-types] Unknown surface: ${surface}`);
  return m;
}

export function isPlatformSurface(s: CanonicalSurface): s is PlatformSurface {
  return PLATFORM_SURFACES.includes(s as PlatformSurface);
}

export function isModeSurface(s: CanonicalSurface): s is SurfaceMode {
  return SURFACE_MODES.includes(s as SurfaceMode);
}
