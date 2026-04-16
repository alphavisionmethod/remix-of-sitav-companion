// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Page Consolidation Map
//
// Phase 1 truth artifact: classifies every admin page on disk
// (src/pages/admin/**) against the 12-domain canonical IA so
// later phases can move, wrap, redirect, or remove safely.
//
// Source of truth: this file is hand-curated and validated by
// `scripts/architecture/checks/check-admin-page-classification-coverage.ts`,
// which fails CI if a page on disk has no entry here.
//
// Mapping rationale: pages are clustered by filename prefix
// (AIG*, AIT*, CN*, MC*, FOUNDER_*, etc.) — the same prefixes
// the team already uses internally. Each cluster maps to one
// canonical domain; individual pages choose a page class.
// ═══════════════════════════════════════════════════════════════

import type { AdminDomain, AdminPageClass } from "./admin-route-registry";

export interface PageConsolidationEntry {
  /** Component name (matches `src/pages/admin/<component>.tsx` or subdir). */
  component: string;
  /** Optional file path relative to src/pages/admin/. */
  filePath?: string;
  /** Current mounted route, if any. */
  currentRoute?: string;
  /** Target canonical domain. */
  targetDomain: AdminDomain;
  /** Target route after Phase 3-5 hubs land. */
  targetRoute: string;
  /** Classification — drives consolidation behavior. */
  pageClass: AdminPageClass;
  /** When merging, the canonical merge target. */
  mergeInto?: string;
  /** Whether a wrapper page is needed during migration. */
  needsWrapper?: boolean;
  /** Unique functionality that must be preserved during merge. */
  uniqueFunctionality?: string;
  /** Free-form note explaining the decision. */
  notes?: string;
}

// ─── Cluster prefix → target domain ──────────────────────────────
export const CLUSTER_DOMAIN_MAP: Record<string, AdminDomain> = {
  // AI Runtime cluster
  AIG: "ai-runtime",
  AIT: "ai-runtime",
  SAG: "ai-runtime",
  CAI: "ai-runtime",
  AI: "ai-runtime",
  Advisor: "ai-runtime",
  Intelligence: "ai-runtime",
  Strategic: "ai-runtime",
  // Integrations cluster
  CN: "integrations",
  PFA: "integrations",
  Connector: "integrations",
  Cloud: "integrations",
  // Trust / Security
  SEC: "trust-security",
  Security: "trust-security",
  Trust: "trust-security",
  Policy: "trust-security",
  // Health
  Fleet: "health",
  Backend: "health",
  Health: "health",
  System: "health",
  // Releases
  AND: "releases",
  APL: "releases",
  Mobile: "releases",
  Release: "releases",
  Launch: "releases",
  // Verification
  AR: "verification",
  Architecture: "verification",
  Verification: "verification",
  Reality: "verification",
  Implementation: "verification",
  // Approvals
  HQ: "approvals",
  Approval: "approvals",
  // Environments
  Team: "environments",
  User: "environments",
  Environment: "environments",
  // Support
  Support: "support",
  Founder: "support",
  Builder: "support",
};

// ─── Curated page classifications ────────────────────────────────
//
// Coverage strategy: Phase 1 explicitly classifies the highest-risk
// pages — the named hubs that compete for "primary" status, and the
// confirmed merge candidates. Pages not in this list are auto-classified
// by `inferEntryFromFilename` (used by the coverage check) so we never
// fall behind on disk reality.
//
export const ADMIN_PAGE_CONSOLIDATION_MAP: PageConsolidationEntry[] = [
  // ── Overview merges (the seven competing executive pages) ──
  {
    component: "AdminDashboard",
    currentRoute: "/admin/dashboard",
    targetDomain: "overview",
    targetRoute: "/admin/overview",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "OverviewHome",
    needsWrapper: true,
    uniqueFunctionality: "Top-line owner KPI tiles, quick links to incidents/approvals.",
    notes: "One of seven competing executive pages — becomes the spine of OverviewHome.",
  },
  {
    component: "AdminOperationsHub",
    currentRoute: "/admin/operations-hub",
    targetDomain: "overview",
    targetRoute: "/admin/overview",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "OverviewHome",
    needsWrapper: true,
    uniqueFunctionality: "Operations triage stream + on-call routing widget.",
  },
  {
    component: "MissionControlHome",
    targetDomain: "overview",
    targetRoute: "/admin/overview",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "OverviewHome",
    needsWrapper: true,
    uniqueFunctionality: "Module-grid navigator (now collapsed into the canonical sub-nav).",
  },
  {
    component: "SystemHealthDashboard",
    targetDomain: "health",
    targetRoute: "/admin/health",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "HealthHome",
    uniqueFunctionality: "Service-mesh health summary; preserve as Health hub headline widget.",
  },
  {
    component: "LaunchReadinessBoard",
    targetDomain: "releases",
    targetRoute: "/admin/releases/launch-readiness",
    pageClass: "SECONDARY_SUBVIEW",
    uniqueFunctionality: "Gate-by-gate readiness matrix.",
  },
  {
    component: "LaunchHonestyBoard",
    targetDomain: "verification",
    targetRoute: "/admin/verification/launch-honesty",
    pageClass: "SECONDARY_SUBVIEW",
    uniqueFunctionality: "Honesty score per claim.",
  },
  {
    component: "GeneratedTruthDashboard",
    currentRoute: "/admin/generated-truth",
    targetDomain: "overview",
    targetRoute: "/admin/overview/generated-truth",
    pageClass: "SECONDARY_SUBVIEW",
    uniqueFunctionality: "Manifest freshness + diff explorer.",
  },

  // ── Approvals merges ──
  {
    component: "AIApprovalDesk",
    targetDomain: "approvals",
    targetRoute: "/admin/approvals",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "ApprovalsHome",
    needsWrapper: true,
    uniqueFunctionality: "AI action approval inbox.",
  },
  {
    component: "AdvisorActionApprovalAdmin",
    targetDomain: "approvals",
    targetRoute: "/admin/approvals/advisor",
    pageClass: "WORKFLOW_TOOL",
    uniqueFunctionality: "Per-advisor approval queue.",
  },
  {
    component: "HQApprovalQueue",
    currentRoute: "/admin/ai-team/approval-queue",
    targetDomain: "approvals",
    targetRoute: "/admin/approvals",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "ApprovalsHome",
    notes: "Same concept as AIT07 — collapse.",
  },
  {
    component: "AIT07ApprovalQueuePage",
    currentRoute: "/admin/ai-team/approvals",
    targetDomain: "approvals",
    targetRoute: "/admin/approvals/ai-team",
    pageClass: "WORKFLOW_TOOL",
  },

  // ── Environments merges ──
  {
    component: "UserManagement",
    currentRoute: "/admin/users",
    targetDomain: "environments",
    targetRoute: "/admin/environments/users",
    pageClass: "SECONDARY_SUBVIEW",
  },
  {
    component: "TeamManagement",
    currentRoute: "/admin/team",
    targetDomain: "environments",
    targetRoute: "/admin/environments/teams",
    pageClass: "SECONDARY_SUBVIEW",
  },
  {
    component: "MCUsersCenter",
    targetDomain: "environments",
    targetRoute: "/admin/environments/users",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "UserManagement",
    notes: "MC users center duplicates UserManagement.",
  },

  // ── AI Runtime merges (the giant cluster) ──
  {
    component: "AIG06LaunchTruth",
    currentRoute: "/admin/ai-gateway/honesty",
    targetDomain: "ai-runtime",
    targetRoute: "/admin/ai-runtime/launch-truth",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "AIG07LaunchTruth",
    notes: "AIG06 vs AIG07 — collapse to single launch-truth view.",
  },
  {
    component: "MCAIControl",
    targetDomain: "ai-runtime",
    targetRoute: "/admin/ai-runtime",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "AIRuntimeHome",
  },
  {
    component: "MCCostsAIBudgets",
    targetDomain: "ai-runtime",
    targetRoute: "/admin/ai-runtime/costs",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "AIT05CostEfficiency",
  },

  // ── Health merges ──
  {
    component: "MCSystemHealth",
    targetDomain: "health",
    targetRoute: "/admin/health",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "HealthHome",
  },

  // ── Trust/Security merges ──
  {
    component: "MCTrustSecurity",
    targetDomain: "trust-security",
    targetRoute: "/admin/trust-security",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "TrustSecurityHome",
  },

  // ── Releases merges ──
  {
    component: "MCReleasesUpdates",
    targetDomain: "releases",
    targetRoute: "/admin/releases",
    pageClass: "DUPLICATE_MERGE_REQUIRED",
    mergeInto: "ReleasesHome",
  },

  // ── Support merges ──
  {
    component: "MCSupport",
    targetDomain: "support",
    targetRoute: "/admin/support",
    pageClass: "SECONDARY_SUBVIEW",
  },

  // ── Config / Knowledge merges ──
  {
    component: "MCKnowledgeBase",
    targetDomain: "config",
    targetRoute: "/admin/config/knowledge",
    pageClass: "SECONDARY_SUBVIEW",
  },
];

// ─── Inference fallback for uncurated pages ──────────────────────
//
// Used by the coverage check: if a page exists on disk but has no
// curated entry, it is auto-classified as DETAIL_EXPLORER under the
// inferred cluster domain. This keeps the system honest: nothing is
// orphaned, nothing is silently deleted.
//
export function inferEntryFromFilename(component: string): PageConsolidationEntry {
  const prefix = component.match(/^([A-Z]+)/)?.[1] ?? "";
  const targetDomain: AdminDomain =
    CLUSTER_DOMAIN_MAP[prefix] ??
    CLUSTER_DOMAIN_MAP[component.split(/(?=[A-Z])/)[0] ?? ""] ??
    "support";
  const slug = component
    .replace(/^[A-Z]+\d*/, "")
    .replace(/Page$/, "")
    .replace(/Dashboard$/, "")
    .replace(/Center$/, "")
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "") || "index";
  return {
    component,
    targetDomain,
    targetRoute: `/admin/${targetDomain}/${slug}`,
    pageClass: "DETAIL_EXPLORER",
    notes: `Auto-classified from filename prefix "${prefix}".`,
  };
}

// ─── Lookup helpers ──────────────────────────────────────────────

export function getEntry(component: string): PageConsolidationEntry | undefined {
  return ADMIN_PAGE_CONSOLIDATION_MAP.find((e) => e.component === component);
}

export function getEntriesForDomain(domain: AdminDomain): PageConsolidationEntry[] {
  return ADMIN_PAGE_CONSOLIDATION_MAP.filter((e) => e.targetDomain === domain);
}

export function getMergeOperations(): Array<{ from: string; into: string }> {
  return ADMIN_PAGE_CONSOLIDATION_MAP
    .filter((e) => e.pageClass === "DUPLICATE_MERGE_REQUIRED" && e.mergeInto)
    .map((e) => ({ from: e.component, into: e.mergeInto! }));
}

export function getPagesNeedingWrappers(): PageConsolidationEntry[] {
  return ADMIN_PAGE_CONSOLIDATION_MAP.filter((e) => e.needsWrapper);
}
