// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Auth & Capability Map
// Maps each route to auth requirements, role requirements,
// and required capabilities/permissions.
// ═══════════════════════════════════════════════════════════════

import type { AuthLevel } from "./route-intent-taxonomy";

export interface RouteAuthCapabilityEntry {
  readonly prefix: string;
  readonly family: string;
  readonly authLevel: AuthLevel;
  readonly requiredRole: string | null;
  readonly requiredCapabilities: readonly string[];
}

export const ROUTE_AUTH_CAPABILITY_MAP: readonly RouteAuthCapabilityEntry[] = [
  { prefix: "/login", family: "Auth", authLevel: "public", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/register", family: "Auth", authLevel: "public", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/auth", family: "Auth", authLevel: "public", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/desktop", family: "Desktop", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/business", family: "Business", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/money", family: "Money", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/concierge", family: "Concierge", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/boardroom", family: "Boardroom", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/files", family: "Files", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/settings", family: "Settings", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/revenue-office", family: "Revenue", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/investment-office", family: "Investment", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/digital-presence", family: "Digital Presence", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/connectors", family: "Connectors", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/advisors", family: "Advisors", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/workspace", family: "Workspace", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/apps", family: "Apps", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/governance", family: "Governance", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/enterprise", family: "Enterprise", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/policies", family: "Policies", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/notifications", family: "Notifications", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/search", family: "Search", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/onboarding", family: "Onboarding", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/observability", family: "Observability", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/nova-desktop", family: "Nova Desktop", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
  { prefix: "/admin", family: "Admin", authLevel: "admin", requiredRole: "admin", requiredCapabilities: ["admin.view"] },
  { prefix: "/owner", family: "Owner", authLevel: "owner", requiredRole: "owner", requiredCapabilities: ["owner.view"] },
  { prefix: "/mission", family: "Mission", authLevel: "admin", requiredRole: "admin", requiredCapabilities: ["admin.view"] },
  { prefix: "/", family: "Landing", authLevel: "authenticated", requiredRole: null, requiredCapabilities: [] },
];

export function getRouteAuthCapability(prefix: string): RouteAuthCapabilityEntry | undefined {
  let best: RouteAuthCapabilityEntry | undefined;
  for (const entry of ROUTE_AUTH_CAPABILITY_MAP) {
    if (prefix === entry.prefix || prefix.startsWith(entry.prefix + "/") || (entry.prefix === "/" && prefix === "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}