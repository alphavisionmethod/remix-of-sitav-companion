// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Deprecation Registry
// Tracks deprecated routes with replacement paths and migration
// status. Consumed by validators and navigation guards.
// ═══════════════════════════════════════════════════════════════

export interface DeprecatedRouteEntry {
  readonly originalPath: string;
  readonly replacementPath: string | null;
  readonly deprecatedAt: string;
  readonly migrationStatus: "pending" | "in-progress" | "complete" | "abandoned";
  readonly reason: string;
}

export const DEPRECATED_ROUTES: readonly DeprecatedRouteEntry[] = [
  // No deprecated routes at this time — all routes are active.
  // Add entries here when routes are sunset.
  // Example:
  // { originalPath: "/old-dashboard", replacementPath: "/desktop", deprecatedAt: "2026-04-01", migrationStatus: "complete", reason: "Replaced by desktop shell" },
];

export function isRouteDeprecated(path: string): boolean {
  return DEPRECATED_ROUTES.some((r) => path === r.originalPath || path.startsWith(r.originalPath + "/"));
}

export function getDeprecatedRouteReplacement(path: string): string | null {
  const entry = DEPRECATED_ROUTES.find((r) => path === r.originalPath || path.startsWith(r.originalPath + "/"));
  return entry?.replacementPath ?? null;
}