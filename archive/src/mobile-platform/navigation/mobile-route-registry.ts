// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Route Registry
// Domain-grouped registry of all mobile surfaces. Source of truth
// for navigation tabs, tier-honesty surfaces, and analytics.
// ═══════════════════════════════════════════════════════════════

export type MobileRouteDomain =
  | "home"
  | "boardroom"
  | "business"
  | "money"
  | "concierge"
  | "settings"
  | "system";

export interface MobileRouteEntry {
  path: string;
  domain: MobileRouteDomain;
  /** Whether this route may be opened via deep-link. */
  deepLinkable: boolean;
  /** Whether the surface is biometric-gated on entry. */
  biometricGated: boolean;
  /** Whether the surface tolerates stale (cached) data. */
  toleratesStale: boolean;
}

export const MOBILE_ROUTE_REGISTRY: ReadonlyArray<MobileRouteEntry> = [
  { path: "/mobile",                 domain: "home",      deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/business",        domain: "business",  deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/money",           domain: "money",     deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/concierge",       domain: "concierge", deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/approvals",       domain: "boardroom", deepLinkable: true,  biometricGated: false, toleratesStale: false },
  { path: "/mobile/approval/:id",    domain: "boardroom", deepLinkable: true,  biometricGated: true,  toleratesStale: false },
  { path: "/mobile/boardroom",       domain: "boardroom", deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/proof",           domain: "boardroom", deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/receipt/:id",     domain: "boardroom", deepLinkable: true,  biometricGated: false, toleratesStale: false },
  { path: "/mobile/alerts",          domain: "system",    deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/emergency",       domain: "system",    deepLinkable: true,  biometricGated: true,  toleratesStale: false },
  { path: "/mobile/device-trust",    domain: "settings",  deepLinkable: true,  biometricGated: true,  toleratesStale: false },
  { path: "/mobile/sync",            domain: "settings",  deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/settings",        domain: "settings",  deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/notifications",   domain: "system",    deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/timeline",        domain: "boardroom", deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/inbox",           domain: "system",    deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/files",           domain: "system",    deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/command",         domain: "system",    deepLinkable: false, biometricGated: false, toleratesStale: false },
  { path: "/mobile/ai-chat",         domain: "system",    deepLinkable: true,  biometricGated: false, toleratesStale: false },
  { path: "/mobile/system-monitor",  domain: "system",    deepLinkable: false, biometricGated: false, toleratesStale: true },
  { path: "/mobile/capture",         domain: "business",  deepLinkable: false, biometricGated: false, toleratesStale: false },
  { path: "/mobile/investment",      domain: "money",     deepLinkable: true,  biometricGated: false, toleratesStale: true },
  { path: "/mobile/more",            domain: "settings",  deepLinkable: true,  biometricGated: false, toleratesStale: true },
] as const;

export function getMobileRouteEntry(path: string): MobileRouteEntry | undefined {
  return MOBILE_ROUTE_REGISTRY.find((r) => r.path === path);
}
