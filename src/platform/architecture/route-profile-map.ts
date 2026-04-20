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

export function getRouteProfile(path: string): RouteProfileEntry | undefined {
  return ROUTE_PROFILE_MAP.find((r) => path.startsWith(r.path) && r.path !== "/" || r.path === path);
}