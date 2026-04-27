// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Role Taxonomy (IA Phase 1)
// ───────────────────────────────────────────────────────────────
// Single source of truth for what kind of surface a page is.
// Every Business / Concierge / Finance page is described by a
// PageDescriptor in src/platform/ia/module-ia-manifest.ts and
// validated by scripts/architecture/checks/check-ia-manifest-coverage.ts
// + src/__tests__/ia/page-role-manifest.test.ts.
//
// DO NOT introduce a parallel role enum. Extend this one.
// ═══════════════════════════════════════════════════════════════

/** Canonical IA roles. See plan §"Canonical Role Taxonomy". */
export type PageRole =
  | "overview"       // Module landing — "the dashboard"
  | "workspace"      // Operator daily surface (list/work view)
  | "engine"         // Stateful automation/decision surface (live runs)
  | "control-plane"  // Configures rules/policies for an engine
  | "boardroom"      // Multi-advisor council surface
  | "proof"          // Evidence / continuity / receipts
  | "settings"       // Module preferences
  | "room"           // Single-purpose deep work surface (Deal Room, War Room)
  | "internal"       // Shell-internal — reachable via sub-tabs of another page only
  | "labs"           // Experimental — flag-gated, hidden from default sidebar
  | "archived";      // Deprecated — file kept for diff history; no shell, no route, no sidebar

/** Module pillar — matches public.module_registry.pillar. */
export type IAModulePillar = "business" | "concierge" | "finance";

/**
 * One canonical page descriptor. Every entry in
 * BUSINESS_IA / CONCIERGE_IA / FINANCE_IA is one of these.
 *
 * Invariants (enforced by validators in Phase 5/7):
 *  • role ∈ overview/workspace/engine/control-plane/boardroom/proof/settings/room
 *      ⇒ MUST have a route shim entry in the corresponding route family
 *  • role = internal       ⇒ MUST NOT have a route shim
 *  • role = labs           ⇒ shim allowed only if featureFlag is set
 *  • role = archived       ⇒ no shim, no shell mount, no sidebar
 *  • legacyNameAllowed = true
 *      ⇒ exempts the descriptor from the Center/Hub/Office naming-grammar lint
 */
export interface PageDescriptor {
  /** Stable shell slug (e.g. "revenue-autopilot"). Matches the key in *AppShell PAGE map. */
  id: string;
  /** Pillar this page belongs to. */
  pillar: IAModulePillar;
  /** Canonical role. */
  role: PageRole;
  /** Display label used in sidebar / breadcrumbs / command palette. */
  label: string;
  /** PascalCase component class name as exported from src/modules/<pillar>/pages/<Name>.tsx */
  component: string;
  /**
   * Canonical deep-link route path (e.g. "/business/revenue-autopilot-console").
   * Required for all non-internal/non-archived roles. `null` for internal/archived/labs (when no shim).
   */
  route: string | null;
  /** Whether this page appears in the in-app sidebar by default. */
  sidebarVisible: boolean;
  /** Production status. `legacy` = visible but slated for removal; `archived` = file moved to _archived/. */
  status: "ga" | "beta" | "legacy" | "archived";
  /** Optional: feature flag that gates this surface (`labs` role typically uses this). */
  featureFlag?: string;
  /** Optional: id of the canonical page that supersedes this one (for deprecations). */
  replacedBy?: string;
  /** Optional: human-facing rationale shown in the truth map MD report. */
  notes?: string;
  /** Optional: exempt this descriptor from the Phase 7 Center/Hub/Office naming-grammar lint. */
  legacyNameAllowed?: boolean;
  /**
   * Legacy slugs that this descriptor absorbs (used by Phase 8 truth map to render the redirect graph).
   * Each entry corresponds to a row in src/routes/redirects/user-redirect-map.ts.
   */
  absorbedSlugs?: string[];
}

/** Roles that REQUIRE a route shim (must be deep-linkable). */
export const ROUTE_REQUIRED_ROLES: ReadonlySet<PageRole> = new Set([
  "overview",
  "workspace",
  "engine",
  "control-plane",
  "boardroom",
  "proof",
  "settings",
  "room",
]);

/** Roles that MUST NOT have a route shim. */
export const ROUTE_FORBIDDEN_ROLES: ReadonlySet<PageRole> = new Set([
  "internal",
  "archived",
]);

/** Roles whose route shim is conditional (allowed iff featureFlag is set). */
export const ROUTE_CONDITIONAL_ROLES: ReadonlySet<PageRole> = new Set([
  "labs",
]);

/** Page-component class-name suffixes banned by the Phase 7 naming-grammar lint. */
export const BANNED_NAME_SUFFIXES = ["Center", "Hub"] as const;

/**
 * Suffixes kept on intent (industry vocabulary). Pages whose component name ends
 * with one of these are allowed without `legacyNameAllowed: true`.
 */
export const ALLOWED_INDUSTRY_SUFFIXES = ["Office", "Room"] as const;

/** Helper: classify a descriptor's required route presence. */
export function classifyRouteRequirement(
  d: PageDescriptor,
): "required" | "forbidden" | "conditional" {
  if (ROUTE_REQUIRED_ROLES.has(d.role)) return "required";
  if (ROUTE_FORBIDDEN_ROLES.has(d.role)) return "forbidden";
  return "conditional";
}