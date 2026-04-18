// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Plane Membership Map
//
// Every route prefix in the app maps to exactly one canonical plane.
// Used by:
//   - useCurrentPlane() to pick the right shell composition
//   - PlaneBoundaryGuard to render plane badges
//   - check-route-plane-coverage.ts CI gate
//   - DeploymentProfile to gate route visibility
// ═══════════════════════════════════════════════════════════════

import type { CanonicalPlaneKey } from "./plane-registry";

export type DeploymentProfileKey = "user" | "operator";

export interface RoutePlaneEntry {
  /** URL prefix (longest-match wins). */
  prefix: string;
  /** Canonical plane the route belongs to. */
  plane: CanonicalPlaneKey;
  /** Profiles where this route is visible/active. */
  profiles: DeploymentProfileKey[];
  /** Optional required permission key (admin-rbac). */
  requiredPermission?: string;
  /** Human-readable purpose for docs. */
  description: string;
}

export const ROUTE_PLANE_MAP: RoutePlaneEntry[] = [
  // ── Admin Control Plane ──
  { prefix: "/admin/founder", plane: "admin", profiles: ["operator"], requiredPermission: "founder.view", description: "Founder strategic console" },
  { prefix: "/admin/engineering", plane: "admin", profiles: ["operator"], requiredPermission: "engineering.view", description: "Engineering ops console" },
  { prefix: "/admin/release", plane: "admin", profiles: ["operator"], requiredPermission: "release.view", description: "Release readiness & gates" },
  { prefix: "/admin/observability", plane: "admin", profiles: ["operator"], requiredPermission: "audit.view", description: "Observability dashboards" },
  { prefix: "/admin/support", plane: "admin", profiles: ["operator"], requiredPermission: "support.view", description: "Support diagnostics & cases" },
  { prefix: "/admin/security", plane: "admin", profiles: ["operator"], requiredPermission: "security.view", description: "Security & kill-switches" },
  { prefix: "/admin/verification", plane: "admin", profiles: ["operator"], requiredPermission: "verification.view", description: "Truth & reality audit" },
  { prefix: "/admin", plane: "admin", profiles: ["operator"], requiredPermission: "admin.view", description: "Admin Control Plane root" },

  // ── User Product Plane ──
  { prefix: "/desktop", plane: "user", profiles: ["user"], description: "User OS desktop home" },
  { prefix: "/business", plane: "user", profiles: ["user"], description: "Business OS app" },
  { prefix: "/money", plane: "user", profiles: ["user"], description: "Money / Finance OS app" },
  { prefix: "/concierge", plane: "user", profiles: ["user"], description: "AI Concierge app" },
  { prefix: "/files", plane: "user", profiles: ["user", "operator"], description: "Files app (shared)" },
  { prefix: "/boardroom", plane: "user", profiles: ["user"], description: "Boardroom advisor surface" },
  { prefix: "/workspace", plane: "user", profiles: ["user"], description: "User workspace" },
  { prefix: "/apps", plane: "user", profiles: ["user"], description: "App store / launcher" },
  { prefix: "/cloud", plane: "user", profiles: ["user"], description: "Cloud surfaces" },

  // ── Shell Runtime (shared) ──
  { prefix: "/launcher", plane: "shell-runtime", profiles: ["user", "operator"], description: "Shared app launcher" },
  { prefix: "/notifications", plane: "shell-runtime", profiles: ["user", "operator"], description: "Shared notifications center" },
  { prefix: "/settings", plane: "shell-runtime", profiles: ["user", "operator"], description: "Shared settings (role-aware sections)" },
  { prefix: "/search", plane: "shell-runtime", profiles: ["user", "operator"], description: "Shared command/search" },

  // ── Backend-services exposed surfaces ──
  { prefix: "/api", plane: "backend-services", profiles: ["user", "operator"], description: "Backend-services HTTP/edge surfaces" },

  // ── Public / fallback ──
  { prefix: "/auth", plane: "shell-runtime", profiles: ["user", "operator"], description: "Auth flows (shared)" },
  { prefix: "/", plane: "user", profiles: ["user"], description: "Marketing / landing fallback" },
];

/** Longest-prefix match. Returns null if no entry matches. */
export function resolveRoutePlane(pathname: string): RoutePlaneEntry | null {
  let best: RoutePlaneEntry | null = null;
  for (const entry of ROUTE_PLANE_MAP) {
    if (pathname === entry.prefix || pathname.startsWith(entry.prefix + "/") || (entry.prefix === "/" && pathname === "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}

export function isRouteVisibleInProfile(
  pathname: string,
  profile: DeploymentProfileKey,
): boolean {
  const entry = resolveRoutePlane(pathname);
  if (!entry) return true; // unknown routes default to visible (CI gate catches gaps)
  return entry.profiles.includes(profile);
}
