// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Runtime Surface Map
// Maps each route to the runtime surfaces where it is available.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "@/runtimes/runtime-tier-model";

export type RouteSurfaceAvailability = "available" | "degraded" | "unavailable";

export interface RouteRuntimeEntry {
  readonly path: string;
  readonly surfaces: Record<RuntimeTier, RouteSurfaceAvailability>;
}

export const ROUTE_RUNTIME_MAP: readonly RouteRuntimeEntry[] = [
  { path: "/", surfaces: { WEB_APP: "available", PWA: "available", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
  { path: "/login", surfaces: { WEB_APP: "available", PWA: "available", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
  { path: "/register", surfaces: { WEB_APP: "available", PWA: "available", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "unavailable" } },
  { path: "/desktop", surfaces: { WEB_APP: "available", PWA: "available", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
  { path: "/admin", surfaces: { WEB_APP: "available", PWA: "degraded", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
  { path: "/settings", surfaces: { WEB_APP: "available", PWA: "available", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
  { path: "/files", surfaces: { WEB_APP: "available", PWA: "available", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
  { path: "/boardroom", surfaces: { WEB_APP: "available", PWA: "degraded", DESKTOP_HOST: "available", APPLIANCE_RUNTIME: "available" } },
];

export function getRouteRuntimeAvailability(path: string): RouteRuntimeEntry | undefined {
  return ROUTE_RUNTIME_MAP.find((r) => r.path === path);
}

export function isRouteAvailableOn(path: string, tier: RuntimeTier): boolean {
  const entry = getRouteRuntimeAvailability(path);
  if (!entry) return true; // unmapped routes default available
  return entry.surfaces[tier] !== "unavailable";
}