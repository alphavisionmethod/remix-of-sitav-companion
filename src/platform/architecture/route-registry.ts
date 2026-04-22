// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Registry
// Maps every major route to its canonical layer, domain, and
// risk tier. Used by admin boards and CI checks.
// ═══════════════════════════════════════════════════════════════

import { LAYERS, type Layer, resolveRouteLayer, resolveRouteDomain } from "./layer-manifest";

export interface RouteEntry {
  path: string;
  layer: Layer;
  domain?: string;
  riskTier: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  flagshipLoop?: string;
  shell: string;
  description?: string;
}

// ── Risk tier assignment logic ──────────────────────────────────

function assignRiskTier(path: string, layer: Layer): RouteEntry["riskTier"] {
  if (path.includes("/payment") || path.includes("/transfer") || path.includes("/tax")) return "R4";
  if (path.includes("/approval") || path.includes("/policy") || path.includes("/kill-switch")) return "R3";
  if (layer === LAYERS.ADMIN_OPERATOR) return "R2";
  if (layer === LAYERS.OS_KERNEL) return "R3";
  if (path.includes("/settings")) return "R1";
  return "R0";
}

function assignShell(layer: Layer, path: string): string {
  if (layer === LAYERS.WEB) return "PublicLayout";
  if (layer === LAYERS.ADMIN_OPERATOR) {
    if (path.startsWith("/owner/")) return "OwnerWorkspaceShell";
    return "AdminControlPlaneShell";
  }
  return "ShellLayout";
}

function assignFlagshipLoop(path: string): string | undefined {
  if (path.startsWith("/business")) return "business-follow-through";
  if (path.startsWith("/money")) return "financial-calm";
  if (path.startsWith("/concierge")) return "invisible-support";
  if (path.startsWith("/boardroom")) return "executive-review";
  return undefined;
}

// ── Build Route Entry ───────────────────────────────────────────

export function buildRouteEntry(path: string, description?: string): RouteEntry {
  const layer = resolveRouteLayer(path);
  return {
    path,
    layer,
    domain: resolveRouteDomain(path),
    riskTier: assignRiskTier(path, layer),
    flagshipLoop: assignFlagshipLoop(path),
    shell: assignShell(layer, path),
    description,
  };
}

// ── Major Route Families ────────────────────────────────────────

export const ROUTE_FAMILIES: { family: string; prefix: string; layer: Layer; routeCount: "few" | "moderate" | "many"; status: "correctly_placed" | "misplaced" | "mixed_boundary" }[] = [
  { family: "Landing/Auth", prefix: "/login", layer: LAYERS.WEB, routeCount: "few", status: "correctly_placed" },
  { family: "Business", prefix: "/business", layer: LAYERS.APP, routeCount: "many", status: "correctly_placed" },
  { family: "Money/Finance", prefix: "/money", layer: LAYERS.APP, routeCount: "many", status: "correctly_placed" },
  { family: "Concierge", prefix: "/concierge", layer: LAYERS.APP, routeCount: "many", status: "correctly_placed" },
  { family: "Boardroom", prefix: "/boardroom", layer: LAYERS.APP, routeCount: "moderate", status: "correctly_placed" },
  { family: "Revenue Office", prefix: "/revenue-office", layer: LAYERS.APP, routeCount: "many", status: "correctly_placed" },
  { family: "Investment Office", prefix: "/investment-office", layer: LAYERS.APP, routeCount: "moderate", status: "correctly_placed" },
  { family: "Digital Presence", prefix: "/digital-presence", layer: LAYERS.APP, routeCount: "moderate", status: "correctly_placed" },
  { family: "Files", prefix: "/files", layer: LAYERS.APP, routeCount: "moderate", status: "correctly_placed" },
  { family: "Settings", prefix: "/settings", layer: LAYERS.APP, routeCount: "moderate", status: "correctly_placed" },
  { family: "Admin Core", prefix: "/admin/", layer: LAYERS.ADMIN_OPERATOR, routeCount: "many", status: "correctly_placed" },
  { family: "Owner", prefix: "/owner/", layer: LAYERS.ADMIN_OPERATOR, routeCount: "many", status: "correctly_placed" },
  { family: "Mission Control", prefix: "/mission/", layer: LAYERS.ADMIN_OPERATOR, routeCount: "many", status: "correctly_placed" },
  { family: "App Store", prefix: "/app-store", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Governance", prefix: "/governance", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Enterprise", prefix: "/enterprise", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Connectors", prefix: "/connectors", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Advisors", prefix: "/advisors", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Policies", prefix: "/policies", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Workspace", prefix: "/workspace", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Observability", prefix: "/observability", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Notifications", prefix: "/notifications", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Search", prefix: "/search", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Onboarding", prefix: "/onboarding", layer: LAYERS.APP, routeCount: "few", status: "correctly_placed" },
  { family: "Nova Desktop", prefix: "/nova-desktop", layer: LAYERS.OS_KERNEL, routeCount: "few", status: "correctly_placed" },
];

// ── Summary Stats ───────────────────────────────────────────────

// ── Canonical Route Lists (consumed by tests) ───────────────────

/** Public routes that do not require authentication */
export const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

/** Representative protected routes derived from ROUTE_FAMILIES */
export const PROTECTED_ROUTE_SAMPLES: string[] = (() => {
  const explicit = ["/"];
  const fromFamilies = ROUTE_FAMILIES
    .filter(f => f.prefix !== "/login") // exclude public auth family
    .map(f => f.prefix.replace(/\/$/, "") || "/")
    .filter(p => p !== "/"); // root already in explicit
  return [...explicit, ...fromFamilies];
})();

export function getRegistrySummary() {
  const byLayer: Record<string, number> = {};
  for (const f of ROUTE_FAMILIES) {
    byLayer[f.layer] = (byLayer[f.layer] || 0) + 1;
  }
  return {
    totalFamilies: ROUTE_FAMILIES.length,
    byLayer,
    misplaced: ROUTE_FAMILIES.filter(f => f.status === "misplaced").length,
    mixed: ROUTE_FAMILIES.filter(f => f.status === "mixed_boundary").length,
  };
}
