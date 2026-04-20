// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Runtime Surface Map
// Maps each route to the runtime surfaces where it is available.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "@/runtimes/runtime-tier-model";

export type RouteSurfaceAvailability = "available" | "degraded" | "unavailable";

type TierSurfaces = Record<RuntimeTier, RouteSurfaceAvailability>;

export interface RouteRuntimeEntry {
  readonly path: string;
  readonly surfaces: TierSurfaces;
}

const all = (v: RouteSurfaceAvailability): TierSurfaces => ({
  WEB_APP: v, DESKTOP_HOST: v, APPLIANCE_RUNTIME: v, SIMULATED_OS_EXPERIENCE: v,
});

export const ROUTE_RUNTIME_MAP: readonly RouteRuntimeEntry[] = [
  { path: "/", surfaces: all("available") },
  { path: "/login", surfaces: all("available") },
  { path: "/register", surfaces: { ...all("available"), APPLIANCE_RUNTIME: "unavailable" } },
  { path: "/desktop", surfaces: all("available") },
  { path: "/admin", surfaces: { ...all("available"), SIMULATED_OS_EXPERIENCE: "degraded" } },
  { path: "/settings", surfaces: all("available") },
  { path: "/files", surfaces: all("available") },
  { path: "/boardroom", surfaces: all("available") },
  { path: "/business", surfaces: all("available") },
  { path: "/money", surfaces: all("available") },
  { path: "/concierge", surfaces: all("available") },
  { path: "/revenue-office", surfaces: all("available") },
  { path: "/investment-office", surfaces: all("available") },
  { path: "/digital-presence", surfaces: { ...all("available"), APPLIANCE_RUNTIME: "unavailable" } },
  { path: "/advisors", surfaces: all("available") },
  { path: "/apps", surfaces: all("available") },
  { path: "/connectors", surfaces: all("available") },
  { path: "/workspace", surfaces: all("available") },
  { path: "/governance", surfaces: all("available") },
  { path: "/enterprise", surfaces: { ...all("available"), APPLIANCE_RUNTIME: "unavailable" } },
  { path: "/policies", surfaces: all("available") },
  { path: "/notifications", surfaces: all("available") },
  { path: "/search", surfaces: all("available") },
  { path: "/onboarding", surfaces: all("available") },
  { path: "/observability", surfaces: all("available") },
  { path: "/owner", surfaces: { ...all("available"), SIMULATED_OS_EXPERIENCE: "degraded", APPLIANCE_RUNTIME: "unavailable" } },
  { path: "/mission", surfaces: { ...all("available"), SIMULATED_OS_EXPERIENCE: "degraded" } },
  { path: "/nova-desktop", surfaces: all("available") },
  { path: "/auth", surfaces: all("available") },
];

export function getRouteRuntimeAvailability(path: string): RouteRuntimeEntry | undefined {
  return ROUTE_RUNTIME_MAP.find((r) => r.path === path);
}

export function isRouteAvailableOn(path: string, tier: RuntimeTier): boolean {
  const entry = getRouteRuntimeAvailability(path);
  if (!entry) return true;
  return entry.surfaces[tier] !== "unavailable";
}