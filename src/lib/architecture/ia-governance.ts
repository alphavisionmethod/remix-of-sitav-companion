// ═══════════════════════════════════════════════════════════════
// SITA OS — Information Architecture Governance
// Runtime guards to prevent IA sprawl from returning.
// ═══════════════════════════════════════════════════════════════

import {
  type PageClass,
  type CanonicalRouteEntry,
  CANONICAL_ROUTE_REGISTRY,
  getTopNavRoutes,
  getIASummary,
} from "./canonical-route-registry";

// ── Governance Constants ────────────────────────────────────────

/** Maximum allowed top-level user navigation destinations */
export const MAX_USER_TOP_LEVEL = 12;

/** Maximum allowed top-level admin navigation domains */
export const MAX_ADMIN_TOP_LEVEL = 12;

/** Valid page class suffixes — enforced in naming conventions */
export const VALID_PAGE_CLASSES: PageClass[] = [
  "overview", "board", "dashboard", "console", "center",
  "workspace", "explorer", "studio", "settings", "timeline",
  "detail", "registry", "monitor", "wizard", "redirect",
];

/** Semantic naming rules — what each page class means */
export const PAGE_CLASS_SEMANTICS: Record<PageClass, string> = {
  overview:   "Domain home / summary landing page",
  board:      "Strategic or cross-signal decision view",
  dashboard:  "Metrics-heavy summary with charts/KPIs",
  console:    "Admin/operator power control surface",
  center:     "Broad domain home with multiple entry points",
  workspace:  "Active task or work-oriented editing area",
  explorer:   "Drill-down, inspection, search, and filter UI",
  studio:     "Configuration, creation, or composition environment",
  settings:   "Preferences, config, and feature toggles",
  timeline:   "Event, proof, history, or audit trail view",
  detail:     "Single-entity deep view or profile",
  registry:   "Canonical records listing with CRUD",
  monitor:    "Real-time observability and metrics stream",
  wizard:     "Multi-step guided flow (onboarding, auth, setup)",
  redirect:   "Compatibility redirect shim to canonical route",
};

// ── Governance Assertions ───────────────────────────────────────

export interface IAViolation {
  rule: string;
  message: string;
  severity: "error" | "warning";
  details?: string;
}

/**
 * Run all IA governance checks and return violations.
 * Zero violations = healthy IA.
 */
export function checkIAGovernance(): IAViolation[] {
  const violations: IAViolation[] = [];
  const summary = getIASummary();

  // Rule 1: User top-level count guard
  if (summary.userTopLevelCount > MAX_USER_TOP_LEVEL) {
    violations.push({
      rule: "max-user-top-level",
      message: `User top-level nav has ${summary.userTopLevelCount} entries (max ${MAX_USER_TOP_LEVEL})`,
      severity: "error",
    });
  }

  // Rule 2: Admin top-level count guard
  if (summary.adminTopLevelCount > MAX_ADMIN_TOP_LEVEL) {
    violations.push({
      rule: "max-admin-top-level",
      message: `Admin top-level nav has ${summary.adminTopLevelCount} entries (max ${MAX_ADMIN_TOP_LEVEL})`,
      severity: "error",
    });
  }

  // Rule 3: No deprecated routes in top nav
  const userTopNav = getTopNavRoutes("user");
  const adminTopNav = getTopNavRoutes("admin");
  const allTopNav = [...userTopNav, ...adminTopNav];

  for (const route of allTopNav) {
    if (route.status === "redirect_to_canonical" || route.status === "deprecated_wrapper") {
      violations.push({
        rule: "no-deprecated-in-nav",
        message: `Deprecated route "${route.path}" appears in top-level navigation`,
        severity: "error",
        details: `Status: ${route.status}, redirect: ${route.redirectTarget}`,
      });
    }
  }

  // Rule 4: Every redirect must have a target
  for (const route of CANONICAL_ROUTE_REGISTRY) {
    if (route.status === "redirect_to_canonical" && !route.redirectTarget) {
      violations.push({
        rule: "redirect-needs-target",
        message: `Redirect route "${route.path}" has no redirectTarget`,
        severity: "error",
      });
    }
  }

  // Rule 5: Page class must be valid
  for (const route of CANONICAL_ROUTE_REGISTRY) {
    if (!VALID_PAGE_CLASSES.includes(route.pageClass)) {
      violations.push({
        rule: "valid-page-class",
        message: `Route "${route.path}" has invalid pageClass "${route.pageClass}"`,
        severity: "error",
      });
    }
  }

  // Rule 6: Duplicate concept detection — no two canonical routes should share path prefix + same pageClass
  const canonicalRoutes = CANONICAL_ROUTE_REGISTRY.filter(r => r.status === "canonical");
  const seen = new Set<string>();
  for (const route of canonicalRoutes) {
    const key = `${route.domain}:${route.pageClass}`;
    if (seen.has(key) && route.pageClass !== "settings" && route.pageClass !== "workspace") {
      violations.push({
        rule: "no-duplicate-canonical",
        message: `Duplicate canonical ${route.pageClass} in domain "${route.domain}" at "${route.path}"`,
        severity: "warning",
      });
    }
    seen.add(key);
  }

  return violations;
}

/**
 * Assert zero governance violations. Throws on failure.
 * Use in CI or tests.
 */
export function assertIAGovernance(): void {
  const violations = checkIAGovernance();
  const errors = violations.filter(v => v.severity === "error");
  if (errors.length > 0) {
    const details = errors.map(v => `  [${v.rule}] ${v.message}`).join("\n");
    throw new Error(`IA Governance: ${errors.length} violations\n${details}`);
  }
}
