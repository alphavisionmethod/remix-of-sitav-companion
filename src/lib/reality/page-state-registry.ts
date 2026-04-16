// ═══════════════════════════════════════════════════════════════
// SITA OS — Page State Registry
// Per-route declaration of class + verified states.
// CI gate: scripts/architecture/checks/check-page-state-coverage.ts
// ═══════════════════════════════════════════════════════════════

import type { PageClass, PageStateRequirement } from "./page-state-contract";
import { PAGE_STATE_CONTRACTS } from "./page-state-contract";

export interface PageStateRegistryEntry {
  readonly route: string;
  readonly pageClass: PageClass;
  readonly file: string;
  readonly verified: readonly PageStateRequirement[];
}

/**
 * Registry of high-traffic / critical routes whose states have been audited.
 * New entries added incrementally as pages are hardened.
 */
export const PAGE_STATE_REGISTRY: readonly PageStateRegistryEntry[] = [
  // Admin — verified
  { route: "/admin/overview",                  pageClass: "dashboard",   file: "src/pages/admin/overview/OverviewHome.tsx",         verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/admin/alerts",                    pageClass: "data-list",   file: "src/pages/admin/alerts/AlertsHome.tsx",             verified: ["loading", "empty", "error", "permission-denied"] },
  { route: "/admin/approvals",                 pageClass: "data-list",   file: "src/pages/admin/approvals/ApprovalsHome.tsx",       verified: ["loading", "empty", "error", "permission-denied"] },
  { route: "/admin/meta-arch/atlas",           pageClass: "dashboard",   file: "src/pages/admin/META01ArchitectureAtlas.tsx",       verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/admin/meta-arch/control-plane",   pageClass: "dashboard",   file: "src/pages/admin/META02ControlPlaneCenter.tsx",      verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/admin/meta-arch/golden-paths",    pageClass: "dashboard",   file: "src/pages/admin/META03GoldenPathHealth.tsx",        verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/admin/meta/reality",              pageClass: "dashboard",   file: "src/pages/admin/META04ProductReality.tsx",          verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/admin/ci/umbrella",               pageClass: "dashboard",   file: "src/pages/admin/CI01CIUmbrellaCenter.tsx",          verified: ["loading", "error", "degraded", "permission-denied"] },
  // Product
  { route: "/boardroom",                       pageClass: "dashboard",   file: "src/pages/Boardroom.tsx",                           verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/business",                        pageClass: "dashboard",   file: "src/pages/BusinessCenter.tsx",                      verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/concierge",                       pageClass: "dashboard",   file: "src/pages/ConciergeCenter.tsx",                     verified: ["loading", "error", "degraded", "permission-denied"] },
  { route: "/communications",                  pageClass: "dashboard",   file: "src/pages/CommunicationsPage.tsx",                  verified: ["loading", "error", "degraded", "permission-denied"] },
];

export function getPageStateContract(route: string): PageStateRegistryEntry | undefined {
  return PAGE_STATE_REGISTRY.find((p) => p.route === route);
}

export function pageStateCoverageStats(): {
  total: number;
  fullyCovered: number;
  partial: number;
  coveragePct: number;
} {
  let fully = 0;
  let partial = 0;
  for (const entry of PAGE_STATE_REGISTRY) {
    const required = PAGE_STATE_CONTRACTS[entry.pageClass].required;
    const missing = required.filter((r) => !entry.verified.includes(r));
    if (missing.length === 0) fully++;
    else partial++;
  }
  const total = PAGE_STATE_REGISTRY.length;
  return {
    total,
    fullyCovered: fully,
    partial,
    coveragePct: total === 0 ? 0 : (fully / total) * 100,
  };
}

export function findUncoveredStates(): { route: string; missing: readonly PageStateRequirement[] }[] {
  const out: { route: string; missing: readonly PageStateRequirement[] }[] = [];
  for (const entry of PAGE_STATE_REGISTRY) {
    const required = PAGE_STATE_CONTRACTS[entry.pageClass].required;
    const missing = required.filter((r) => !entry.verified.includes(r));
    if (missing.length > 0) out.push({ route: entry.route, missing });
  }
  return out;
}
