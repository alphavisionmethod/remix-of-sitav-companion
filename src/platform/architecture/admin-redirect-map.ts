// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Redirect Map (Wave 0.8 — moved here from
// src/admin/redirects/admin-redirect-map.ts to eliminate the last
// platform → admin import. The data is purely route-mapping and
// has no operator-UI semantics, so it lives in the architecture
// runtime-bridges layer of platform.)
//
// Auto-derived from the consolidation map: every legacy / duplicate
// admin route resolves to its canonical target via <Navigate replace />.
// This guarantees zero broken bookmarks during Phase 5 view migration.
//
// Source of truth: admin-page-consolidation-map.ts. Whenever an entry
// is marked DUPLICATE_MERGE_REQUIRED, DEPRECATE_WITH_REDIRECT, or
// REMOVE_AFTER_SAFE_MIGRATION, a redirect is emitted here automatically
// (via the buildAdminRedirects() helper).
//
// CI gate: scripts/architecture/checks/check-redirect-coverage.ts
// fails if a deprecated entry exists with no redirect target.
// ═══════════════════════════════════════════════════════════════

import {
  ADMIN_PAGE_CONSOLIDATION_MAP,
  type PageConsolidationEntry,
} from "@/platform/architecture/admin-page-consolidation-map";

export interface AdminRedirect {
  /** Old / legacy URL path. */
  from: string;
  /** Canonical URL path to redirect to. */
  to: string;
  /** Why this redirect exists. */
  reason: "duplicate-merge" | "deprecate" | "safe-removal";
  /** Source page component. */
  sourceComponent: string;
}

const REDIRECT_PAGE_CLASSES = new Set([
  "DUPLICATE_MERGE_REQUIRED",
  "DEPRECATE_WITH_REDIRECT",
  "REMOVE_AFTER_SAFE_MIGRATION",
]);

function reasonFor(entry: PageConsolidationEntry): AdminRedirect["reason"] {
  if (entry.pageClass === "DEPRECATE_WITH_REDIRECT") return "deprecate";
  if (entry.pageClass === "REMOVE_AFTER_SAFE_MIGRATION") return "safe-removal";
  return "duplicate-merge";
}

/** Build the admin redirect list from the consolidation map. */
export function buildAdminRedirects(): AdminRedirect[] {
  const out: AdminRedirect[] = [];
  for (const e of ADMIN_PAGE_CONSOLIDATION_MAP) {
    if (!REDIRECT_PAGE_CLASSES.has(e.pageClass)) continue;
    if (!e.currentRoute) continue;
    if (!e.targetRoute || e.targetRoute === e.currentRoute) continue;
    out.push({
      from: e.currentRoute,
      to: e.targetRoute,
      reason: reasonFor(e),
      sourceComponent: e.component,
    });
  }
  // Hand-curated additional aliases beyond the consolidation map.
  // These are URLs that were historically published but never had a
  // page entry of their own.
  const ALIASES: AdminRedirect[] = [
    { from: "/admin/operations-hub", to: "/admin/overview", reason: "duplicate-merge", sourceComponent: "AdminOperationsHub" },
    { from: "/admin/mission-control", to: "/admin/overview", reason: "duplicate-merge", sourceComponent: "MissionControlHome" },
    { from: "/admin/system-health", to: "/admin/health", reason: "duplicate-merge", sourceComponent: "SystemHealthDashboard" },
    { from: "/admin/intelligence", to: "/admin/intelligence/efficiency", reason: "deprecate", sourceComponent: "IntelligenceLayerAdmin" },
    { from: "/admin/ai", to: "/admin/ai-runtime", reason: "deprecate", sourceComponent: "AIRuntimeHome" },
  ];
  return [...out, ...ALIASES];
}

export const ADMIN_REDIRECTS: AdminRedirect[] = buildAdminRedirects();