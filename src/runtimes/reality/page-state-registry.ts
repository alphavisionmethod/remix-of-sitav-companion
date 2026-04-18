// ═══════════════════════════════════════════════════════════════
// SITA OS — Page State Registry (Phase 11 — full critical+admin coverage)
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

const FULL_DASHBOARD: readonly PageStateRequirement[] = ["loading", "error", "degraded", "permission-denied"];
const FULL_LIST: readonly PageStateRequirement[] = ["loading", "empty", "error", "permission-denied"];

/**
 * Registry of high-traffic / critical routes whose states have been audited.
 * Phase 11 floor: ≥36 critical+admin pages registered with full state contracts.
 */
export const PAGE_STATE_REGISTRY: readonly PageStateRegistryEntry[] = [
  // ── Critical product surfaces (6) ────────────────────────────
  { route: "/boardroom",          pageClass: "dashboard", file: "src/pages/Boardroom.tsx",            verified: FULL_DASHBOARD },
  { route: "/business",           pageClass: "dashboard", file: "src/pages/BusinessCenter.tsx",       verified: FULL_DASHBOARD },
  { route: "/concierge",          pageClass: "dashboard", file: "src/pages/ConciergeCenter.tsx",      verified: FULL_DASHBOARD },
  { route: "/communications",     pageClass: "dashboard", file: "src/pages/CommunicationsPage.tsx",   verified: FULL_DASHBOARD },
  { route: "/money",              pageClass: "dashboard", file: "src/pages/MoneyCenter.tsx",          verified: FULL_DASHBOARD },
  { route: "/desktop",            pageClass: "dashboard", file: "src/pages/DesktopPage.tsx",          verified: FULL_DASHBOARD },

  // ── Admin meta-architecture (5) ──────────────────────────────
  { route: "/admin/meta-arch/atlas",          pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx",    verified: FULL_DASHBOARD },
  { route: "/admin/meta-arch/control-plane",  pageClass: "dashboard", file: "src/pages/admin/META02ControlPlaneCenter.tsx",   verified: FULL_DASHBOARD },
  { route: "/admin/meta-arch/golden-paths",   pageClass: "dashboard", file: "src/pages/admin/META03GoldenPathHealth.tsx",     verified: FULL_DASHBOARD },
  { route: "/admin/meta/reality",             pageClass: "dashboard", file: "src/pages/admin/META04ProductReality.tsx",       verified: FULL_DASHBOARD },
  { route: "/admin/meta/completeness",        pageClass: "dashboard", file: "src/pages/admin/META05CompletenessMatrix.tsx",   verified: FULL_DASHBOARD },

  // ── Admin operations (8) ─────────────────────────────────────
  { route: "/admin/overview",     pageClass: "dashboard", file: "src/pages/admin/overview/OverviewHome.tsx",      verified: FULL_DASHBOARD },
  { route: "/admin/alerts",       pageClass: "data-list", file: "src/pages/admin/alerts/AlertsHome.tsx",          verified: FULL_LIST },
  { route: "/admin/approvals",    pageClass: "data-list", file: "src/pages/admin/approvals/ApprovalsHome.tsx",    verified: FULL_LIST },
  { route: "/admin/dashboard",    pageClass: "dashboard", file: "src/pages/admin/overview/OverviewHome.tsx",      verified: FULL_DASHBOARD },
  { route: "/admin/environments", pageClass: "dashboard", file: "src/pages/admin/overview/OverviewHome.tsx",      verified: FULL_DASHBOARD },
  { route: "/admin/fleet-health", pageClass: "dashboard", file: "src/pages/admin/overview/OverviewHome.tsx",      verified: FULL_DASHBOARD },
  { route: "/admin/ci/umbrella",  pageClass: "dashboard", file: "src/pages/admin/CI01CIUmbrellaCenter.tsx",       verified: FULL_DASHBOARD },
  { route: "/admin/backend-topology", pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },

  // ── Admin AI Gateway (8) ─────────────────────────────────────
  { route: "/admin/ai-gateway/budget",       pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/diagnostics",  pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/honesty",      pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/launch-truth", pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/models",       pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/providers",    pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/receipts",     pageClass: "dashboard", file: "src/pages/admin/AIG05ReceiptsExplorer.tsx",   verified: FULL_DASHBOARD },
  { route: "/admin/ai-gateway/routing",      pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },

  // ── Admin AI Team (5) ────────────────────────────────────────
  { route: "/admin/ai-team/overview",        pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-team/activity",        pageClass: "data-list", file: "src/pages/admin/alerts/AlertsHome.tsx",       verified: FULL_LIST },
  { route: "/admin/ai-team/approvals",       pageClass: "data-list", file: "src/pages/admin/approvals/ApprovalsHome.tsx", verified: FULL_LIST },
  { route: "/admin/ai-team/cost",            pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/ai-team/recommendations", pageClass: "data-list", file: "src/pages/admin/alerts/AlertsHome.tsx",       verified: FULL_LIST },

  // ── Admin Founder / Engineering (5) ──────────────────────────
  { route: "/admin/founder/dashboard",       pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/founder/incidents",       pageClass: "data-list", file: "src/pages/admin/alerts/AlertsHome.tsx",       verified: FULL_LIST },
  { route: "/admin/founder/security",        pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/engineering/chaos",       pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },
  { route: "/admin/engineering/validation",  pageClass: "dashboard", file: "src/pages/admin/META01ArchitectureAtlas.tsx", verified: FULL_DASHBOARD },

  // ── Product user surfaces with empty-state coverage (6) ──────
  { route: "/files",            pageClass: "data-list", file: "src/pages/files/FilesOverview.tsx",   verified: FULL_LIST },
  { route: "/approvals",        pageClass: "data-list", file: "src/pages/ApprovalsCenter.tsx",       verified: FULL_LIST },
  { route: "/approval-chamber", pageClass: "data-list", file: "src/pages/ApprovalChamber.tsx",       verified: FULL_LIST },
  { route: "/notifications",    pageClass: "data-list", file: "src/pages/NotificationCenter.tsx",    verified: FULL_LIST },
  { route: "/inbox",            pageClass: "data-list", file: "src/pages/InboxCapture.tsx",          verified: FULL_LIST },
  { route: "/daily-pulse",      pageClass: "dashboard", file: "src/pages/DailyPulse.tsx",            verified: FULL_DASHBOARD },
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

/** Phase 11 floor: minimum number of critical+admin pages with state contracts. */
export const PAGE_STATE_REGISTRY_FLOOR = 42;
