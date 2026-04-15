// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Route Registry
// The single authoritative IA taxonomy for user + admin surfaces.
// Every route maps to a canonical domain, page class, and status.
// ═══════════════════════════════════════════════════════════════

// ── Page Class Taxonomy ─────────────────────────────────────────

export type PageClass =
  | "overview"     // Domain home / summary
  | "board"        // Strategic / cross-signal decisions
  | "dashboard"    // Metrics-heavy summary
  | "console"      // Admin/operator control surface
  | "center"       // Broad domain home
  | "workspace"    // Active task/work environment
  | "explorer"     // Drill-down / inspection UI
  | "studio"       // Configuration / creation environment
  | "settings"     // Preferences / config
  | "timeline"     // Event / proof / history view
  | "detail"       // Single-entity deep view
  | "registry"     // Canonical records listing
  | "monitor"      // Real-time observability view
  | "wizard"       // Multi-step guided flow
  | "redirect";    // Compatibility shim

// ── Consolidation Status ────────────────────────────────────────

export type ConsolidationStatus =
  | "canonical"            // Primary destination — this IS the page
  | "subview"              // Rendered inside a canonical parent
  | "redirect_to_canonical" // Old route that redirects to canonical
  | "deprecated_wrapper"   // Compatibility wrapper, will be removed
  | "system_utility"       // OS-level utility, no top-level nav
  | "auth_flow";           // Authentication pages

// ── Canonical Domain IDs ────────────────────────────────────────

export const USER_DOMAINS = {
  DESKTOP:          "desktop",
  BOARDROOM:        "boardroom",
  BUSINESS:         "business",
  MONEY:            "money",
  CONCIERGE:        "concierge",
  FILES:            "files",
  INVESTMENTS:      "investments",
  REVENUE_OFFICE:   "revenue-office",
  DIGITAL_PRESENCE: "digital-presence",
  SETTINGS:         "settings",
  // System utilities (not primary nav)
  SEARCH:           "search",
  NOTIFICATIONS:    "notifications",
  APPS:             "apps",
  COMMUNICATIONS:   "communications",
  AUTH:             "auth",
  ONBOARDING:       "onboarding",
  PRODUCTIVITY:     "productivity",
} as const;

export const ADMIN_DOMAINS = {
  OVERVIEW:         "admin-overview",
  USERS:            "admin-users",
  AI_RUNTIME:       "admin-ai-runtime",
  INTEGRATIONS:     "admin-integrations",
  TRUST_SECURITY:   "admin-trust-security",
  HEALTH:           "admin-health",
  RELEASES:         "admin-releases",
  VERIFICATION:     "admin-verification",
  CONFIG:           "admin-config",
  SUPPORT:          "admin-support",
  // Internal planes (not top-level admin nav)
  FOUNDER:          "admin-founder",
  ENGINEERING:      "admin-engineering",
  STRATEGIC:        "admin-strategic",
  CLOUD:            "admin-cloud",
  SURFACES:         "admin-surfaces",
  REALITY:          "admin-reality",
} as const;

export type UserDomain = (typeof USER_DOMAINS)[keyof typeof USER_DOMAINS];
export type AdminDomain = (typeof ADMIN_DOMAINS)[keyof typeof ADMIN_DOMAINS];
export type CanonicalDomain = UserDomain | AdminDomain;

// ── Canonical Route Entry ───────────────────────────────────────

export interface CanonicalRouteEntry {
  /** The route path as defined in React Router */
  path: string;
  /** Canonical domain this route belongs to */
  domain: CanonicalDomain;
  /** Page classification */
  pageClass: PageClass;
  /** Whether this is primary, subview, redirect, etc. */
  status: ConsolidationStatus;
  /** If redirected/deprecated, where does it point? */
  redirectTarget?: string;
  /** Human description */
  description?: string;
  /** Whether this route appears in top-level navigation */
  topNavVisible: boolean;
  /** The windowed app shell this route opens (if shim pattern) */
  appShell?: string;
}

// ── User App Canonical Routes ───────────────────────────────────

export const USER_CANONICAL_ROUTES: CanonicalRouteEntry[] = [
  // Desktop
  { path: "/", domain: "desktop", pageClass: "redirect", status: "redirect_to_canonical", redirectTarget: "/desktop", topNavVisible: false },
  { path: "/desktop", domain: "desktop", pageClass: "overview", status: "canonical", topNavVisible: true, description: "OS Desktop / Home" },

  // Boardroom
  { path: "/boardroom", domain: "boardroom", pageClass: "board", status: "canonical", topNavVisible: true, appShell: "BoardroomApp", description: "Unified Boardroom" },
  { path: "/boardroom/business", domain: "boardroom", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/boardroom/finance", domain: "boardroom", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/boardroom/family", domain: "boardroom", pageClass: "board", status: "subview", topNavVisible: false },

  // Business OS
  { path: "/business", domain: "business", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "BusinessApp", description: "Business OS" },
  { path: "/business/overview", domain: "business", pageClass: "overview", status: "subview", topNavVisible: false },
  { path: "/business/leads", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/customers", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/opportunities", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/quotes", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/invoices", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/collections", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/communications", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/boardroom", domain: "business", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/business/proof", domain: "business", pageClass: "timeline", status: "subview", topNavVisible: false },
  { path: "/business/files", domain: "business", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/business/settings", domain: "business", pageClass: "settings", status: "subview", topNavVisible: false },
  { path: "/business/operations", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/crm-home", domain: "business", pageClass: "overview", status: "subview", topNavVisible: false },
  { path: "/business/crm-contacts", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/business/crm-pipeline", domain: "business", pageClass: "workspace", status: "subview", topNavVisible: false },

  // Money OS
  { path: "/money", domain: "money", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "FinanceApp", description: "Money OS" },
  { path: "/money/overview", domain: "money", pageClass: "overview", status: "subview", topNavVisible: false },
  { path: "/money/bills", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/subscriptions", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/reserves", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/cash-timing", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/receivables", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/investment-office", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/approvals", domain: "money", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/money/proof", domain: "money", pageClass: "timeline", status: "subview", topNavVisible: false },
  { path: "/money/files", domain: "money", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/money/boardroom", domain: "money", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/money/settings", domain: "money", pageClass: "settings", status: "subview", topNavVisible: false },

  // Concierge OS
  { path: "/concierge", domain: "concierge", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "ConciergeApp", description: "Concierge OS" },
  { path: "/concierge/overview", domain: "concierge", pageClass: "overview", status: "subview", topNavVisible: false },
  { path: "/concierge/calendar", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/tasks", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/grocery", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/travel", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/providers", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/events", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/workflows", domain: "concierge", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/concierge/proof", domain: "concierge", pageClass: "timeline", status: "subview", topNavVisible: false },
  { path: "/concierge/files", domain: "concierge", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/concierge/boardroom", domain: "concierge", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/concierge/settings", domain: "concierge", pageClass: "settings", status: "subview", topNavVisible: false },

  // Files
  { path: "/files", domain: "files", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "FilesApp", description: "Files" },
  { path: "/files/all", domain: "files", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/files/processing", domain: "files", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/files/review", domain: "files", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/files/search", domain: "files", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/files/sensitive", domain: "files", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/files/settings", domain: "files", pageClass: "settings", status: "subview", topNavVisible: false },

  // Investments
  { path: "/investments", domain: "investments", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "InvestmentApp", description: "Investment Office" },

  // Revenue Office
  { path: "/revenue-office", domain: "revenue-office", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "RevenueOfficeApp", description: "Revenue Office" },

  // Digital Presence
  { path: "/digital-presence", domain: "digital-presence", pageClass: "center", status: "canonical", topNavVisible: true, appShell: "DigitalPresenceApp", description: "Digital Presence" },

  // Settings
  { path: "/settings", domain: "settings", pageClass: "settings", status: "canonical", topNavVisible: true, description: "Settings" },
  { path: "/settings/trust", domain: "settings", pageClass: "settings", status: "subview", topNavVisible: false },
  { path: "/settings/profile", domain: "settings", pageClass: "settings", status: "subview", topNavVisible: false },
  { path: "/settings/connectors", domain: "settings", pageClass: "settings", status: "subview", topNavVisible: false },
  { path: "/settings/permissions", domain: "settings", pageClass: "settings", status: "subview", topNavVisible: false },
  { path: "/settings/billing", domain: "settings", pageClass: "settings", status: "subview", topNavVisible: false },

  // Apps / Store
  { path: "/store", domain: "apps", pageClass: "explorer", status: "canonical", topNavVisible: false, description: "App Store" },
  { path: "/app-store", domain: "apps", pageClass: "redirect", status: "redirect_to_canonical", redirectTarget: "/store", topNavVisible: false },

  // Communications
  { path: "/communications", domain: "communications", pageClass: "center", status: "canonical", topNavVisible: false, description: "Communications Hub" },

  // Auth (not in nav)
  { path: "/login", domain: "auth", pageClass: "wizard", status: "auth_flow", topNavVisible: false },
  { path: "/signup", domain: "auth", pageClass: "wizard", status: "auth_flow", topNavVisible: false },
  { path: "/forgot-password", domain: "auth", pageClass: "wizard", status: "auth_flow", topNavVisible: false },
  { path: "/reset-password", domain: "auth", pageClass: "wizard", status: "auth_flow", topNavVisible: false },

  // Productivity
  { path: "/productivity", domain: "productivity", pageClass: "center", status: "canonical", topNavVisible: false, description: "Productivity Hub" },
  { path: "/productivity/docs", domain: "productivity", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/productivity/sheets", domain: "productivity", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/productivity/slides", domain: "productivity", pageClass: "workspace", status: "subview", topNavVisible: false },

  // Proof & Approvals
  { path: "/proof", domain: "desktop", pageClass: "timeline", status: "canonical", topNavVisible: false },
  { path: "/approvals", domain: "desktop", pageClass: "workspace", status: "canonical", topNavVisible: false },
  { path: "/advisors", domain: "desktop", pageClass: "workspace", status: "canonical", topNavVisible: false },
];

// ── Admin Control Plane Canonical Routes ────────────────────────

export const ADMIN_CANONICAL_ROUTES: CanonicalRouteEntry[] = [
  // Domain 1: Executive Overview
  { path: "/admin/overview", domain: "admin-overview", pageClass: "dashboard", status: "canonical", topNavVisible: true, description: "Executive Overview — system summary, incidents, trust posture" },
  { path: "/admin/dashboard", domain: "admin-overview", pageClass: "redirect", status: "redirect_to_canonical", redirectTarget: "/admin/overview", topNavVisible: false },

  // Domain 2: Users & Environments
  { path: "/admin/users", domain: "admin-users", pageClass: "console", status: "canonical", topNavVisible: true, description: "Users, environments, devices, sessions" },
  { path: "/admin/users/environments", domain: "admin-users", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/users/devices", domain: "admin-users", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/users/sessions", domain: "admin-users", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/users/permissions", domain: "admin-users", pageClass: "settings", status: "subview", topNavVisible: false },

  // Domain 3: AI Runtime
  { path: "/admin/ai-runtime", domain: "admin-ai-runtime", pageClass: "console", status: "canonical", topNavVisible: true, description: "Advisors, workforce, models, routing, costs" },
  { path: "/admin/ai-runtime/advisors", domain: "admin-ai-runtime", pageClass: "registry", status: "subview", topNavVisible: false },
  { path: "/admin/ai-runtime/workforce", domain: "admin-ai-runtime", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/ai-runtime/models", domain: "admin-ai-runtime", pageClass: "registry", status: "subview", topNavVisible: false },
  { path: "/admin/ai-runtime/routing", domain: "admin-ai-runtime", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/ai-runtime/prompts", domain: "admin-ai-runtime", pageClass: "studio", status: "subview", topNavVisible: false },
  { path: "/admin/ai-runtime/costs", domain: "admin-ai-runtime", pageClass: "dashboard", status: "subview", topNavVisible: false },
  { path: "/admin/ai-runtime/failures", domain: "admin-ai-runtime", pageClass: "monitor", status: "subview", topNavVisible: false },

  // Domain 4: Integrations
  { path: "/admin/integrations", domain: "admin-integrations", pageClass: "console", status: "canonical", topNavVisible: true, description: "Connectors, OAuth, sync health, webhooks" },
  { path: "/admin/integrations/providers", domain: "admin-integrations", pageClass: "registry", status: "subview", topNavVisible: false },
  { path: "/admin/integrations/connectors", domain: "admin-integrations", pageClass: "registry", status: "subview", topNavVisible: false },
  { path: "/admin/integrations/oauth", domain: "admin-integrations", pageClass: "settings", status: "subview", topNavVisible: false },
  { path: "/admin/integrations/sync", domain: "admin-integrations", pageClass: "monitor", status: "subview", topNavVisible: false },
  { path: "/admin/integrations/health", domain: "admin-integrations", pageClass: "monitor", status: "subview", topNavVisible: false },
  { path: "/admin/integrations/webhooks", domain: "admin-integrations", pageClass: "console", status: "subview", topNavVisible: false },

  // Domain 5: Trust & Security
  { path: "/admin/trust-security", domain: "admin-trust-security", pageClass: "console", status: "canonical", topNavVisible: true, description: "Policies, approvals, security, proofs, audit" },
  { path: "/admin/trust-security/policies", domain: "admin-trust-security", pageClass: "studio", status: "subview", topNavVisible: false },
  { path: "/admin/trust-security/approvals", domain: "admin-trust-security", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/admin/trust-security/security", domain: "admin-trust-security", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/trust-security/proofs", domain: "admin-trust-security", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/trust-security/audit", domain: "admin-trust-security", pageClass: "timeline", status: "subview", topNavVisible: false },
  { path: "/admin/trust-security/identity", domain: "admin-trust-security", pageClass: "console", status: "subview", topNavVisible: false },

  // Domain 6: Health & Observability
  { path: "/admin/health", domain: "admin-health", pageClass: "dashboard", status: "canonical", topNavVisible: true, description: "Observability, incidents, fleet, runtime continuity" },
  { path: "/admin/health/observability", domain: "admin-health", pageClass: "monitor", status: "subview", topNavVisible: false },
  { path: "/admin/health/incidents", domain: "admin-health", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/health/runtime", domain: "admin-health", pageClass: "monitor", status: "subview", topNavVisible: false },
  { path: "/admin/health/continuity", domain: "admin-health", pageClass: "monitor", status: "subview", topNavVisible: false },
  { path: "/admin/health/storage", domain: "admin-health", pageClass: "monitor", status: "subview", topNavVisible: false },
  { path: "/admin/health/fleet", domain: "admin-health", pageClass: "monitor", status: "subview", topNavVisible: false },

  // Domain 7: Releases & Deployments
  { path: "/admin/releases", domain: "admin-releases", pageClass: "console", status: "canonical", topNavVisible: true, description: "Deployment rings, launch readiness, rollback" },
  { path: "/admin/releases/launch-readiness", domain: "admin-releases", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/admin/releases/deployment-rings", domain: "admin-releases", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/releases/vmware", domain: "admin-releases", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/releases/mobile", domain: "admin-releases", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/releases/rollback", domain: "admin-releases", pageClass: "console", status: "subview", topNavVisible: false },

  // Domain 8: Verification & Truth
  { path: "/admin/verification", domain: "admin-verification", pageClass: "console", status: "canonical", topNavVisible: true, description: "Implementation truth, launch honesty, reality audit" },
  { path: "/admin/verification/implementation-truth", domain: "admin-verification", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/verification/launch-honesty", domain: "admin-verification", pageClass: "board", status: "subview", topNavVisible: false },
  { path: "/admin/verification/reality-audit", domain: "admin-verification", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/verification/customer-journeys", domain: "admin-verification", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/verification/conformance", domain: "admin-verification", pageClass: "dashboard", status: "subview", topNavVisible: false },

  // Domain 9: Config & Flags
  { path: "/admin/config", domain: "admin-config", pageClass: "console", status: "canonical", topNavVisible: true, description: "Feature flags, templates, manifests, registries" },
  { path: "/admin/config/feature-flags", domain: "admin-config", pageClass: "studio", status: "subview", topNavVisible: false },
  { path: "/admin/config/templates", domain: "admin-config", pageClass: "studio", status: "subview", topNavVisible: false },
  { path: "/admin/config/content", domain: "admin-config", pageClass: "studio", status: "subview", topNavVisible: false },
  { path: "/admin/config/manifests", domain: "admin-config", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/config/registries", domain: "admin-config", pageClass: "registry", status: "subview", topNavVisible: false },

  // Domain 10: Support & Recovery
  { path: "/admin/support", domain: "admin-support", pageClass: "console", status: "canonical", topNavVisible: true, description: "Cases, diagnostics, replay, recovery" },
  { path: "/admin/support/cases", domain: "admin-support", pageClass: "workspace", status: "subview", topNavVisible: false },
  { path: "/admin/support/diagnostics", domain: "admin-support", pageClass: "console", status: "subview", topNavVisible: false },
  { path: "/admin/support/replay", domain: "admin-support", pageClass: "explorer", status: "subview", topNavVisible: false },
  { path: "/admin/support/recovery", domain: "admin-support", pageClass: "console", status: "subview", topNavVisible: false },
];

// ── Combined Registry ───────────────────────────────────────────

export const CANONICAL_ROUTE_REGISTRY: CanonicalRouteEntry[] = [
  ...USER_CANONICAL_ROUTES,
  ...ADMIN_CANONICAL_ROUTES,
];

// ── Lookup Helpers ──────────────────────────────────────────────

export function findCanonicalRoute(path: string): CanonicalRouteEntry | undefined {
  return CANONICAL_ROUTE_REGISTRY.find(r => r.path === path);
}

export function getCanonicalDomainRoutes(domain: CanonicalDomain): CanonicalRouteEntry[] {
  return CANONICAL_ROUTE_REGISTRY.filter(r => r.domain === domain);
}

export function getTopNavRoutes(surface: "user" | "admin"): CanonicalRouteEntry[] {
  const routes = surface === "user" ? USER_CANONICAL_ROUTES : ADMIN_CANONICAL_ROUTES;
  return routes.filter(r => r.topNavVisible);
}

export function getRedirectMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of CANONICAL_ROUTE_REGISTRY) {
    if (r.status === "redirect_to_canonical" && r.redirectTarget) {
      map[r.path] = r.redirectTarget;
    }
  }
  return map;
}

// ── Summary ─────────────────────────────────────────────────────

export function getIASummary() {
  const userTop = getTopNavRoutes("user");
  const adminTop = getTopNavRoutes("admin");
  const domains = new Set(CANONICAL_ROUTE_REGISTRY.map(r => r.domain));
  const byStatus: Record<string, number> = {};
  const byPageClass: Record<string, number> = {};

  for (const r of CANONICAL_ROUTE_REGISTRY) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byPageClass[r.pageClass] = (byPageClass[r.pageClass] || 0) + 1;
  }

  return {
    totalCanonicalRoutes: CANONICAL_ROUTE_REGISTRY.length,
    userTopLevelCount: userTop.length,
    adminTopLevelCount: adminTop.length,
    uniqueDomains: domains.size,
    byStatus,
    byPageClass,
  };
}
