// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Deployment Profile Map
// Maps routes to their deployment profile audience.
// ═══════════════════════════════════════════════════════════════

export type DeploymentProfile = "user" | "operator" | "both";

export interface RouteProfileEntry {
  readonly path: string;
  readonly profile: DeploymentProfile;
  readonly requiresAuth: boolean;
  readonly shell: "desktop" | "admin" | "auth" | "minimal";
}

export const ROUTE_PROFILE_MAP: readonly RouteProfileEntry[] = [
  { path: "/", profile: "both", requiresAuth: true, shell: "desktop" },
  { path: "/login", profile: "both", requiresAuth: false, shell: "auth" },
  { path: "/register", profile: "both", requiresAuth: false, shell: "auth" },
  { path: "/desktop", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/settings", profile: "both", requiresAuth: true, shell: "desktop" },
  { path: "/files", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/boardroom", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/admin", profile: "operator", requiresAuth: true, shell: "admin" },
  { path: "/admin/ai-engineering", profile: "operator", requiresAuth: true, shell: "admin" },
  { path: "/admin/kill-switches", profile: "operator", requiresAuth: true, shell: "admin" },
  { path: "/admin/runbooks", profile: "operator", requiresAuth: true, shell: "admin" },
];
  { path: "/business", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/money", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/concierge", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/revenue-office", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/investment-office", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/digital-presence", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/advisors", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/apps", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/connectors", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/workspace", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/governance", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/enterprise", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/policies", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/notifications", profile: "both", requiresAuth: true, shell: "desktop" },
  { path: "/search", profile: "both", requiresAuth: true, shell: "desktop" },
  { path: "/onboarding", profile: "user", requiresAuth: true, shell: "minimal" },
  { path: "/observability", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/owner", profile: "operator", requiresAuth: true, shell: "admin" },
  { path: "/mission", profile: "operator", requiresAuth: true, shell: "admin" },
  { path: "/nova-desktop", profile: "user", requiresAuth: true, shell: "desktop" },
  { path: "/auth", profile: "both", requiresAuth: false, shell: "auth" },

export function getRouteProfile(path: string): RouteProfileEntry | undefined {
  return ROUTE_PROFILE_MAP.find((r) => path.startsWith(r.path) && r.path !== "/" || r.path === path);
}