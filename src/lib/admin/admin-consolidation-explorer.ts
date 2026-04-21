// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Consolidation Explorer
//
// Analyzes admin pages/tabs for merge/archive opportunities and
// generates remapped routes/tabs automatically.
// ═══════════════════════════════════════════════════════════════

import { AI_ENGINEER_HUB_TABS, type AIEngineerTabSpec } from "./ai-engineer-hub/tab-registry";

// ── Types ──────────────────────────────────────────────────────

export type ConsolidationAction = "merge" | "archive" | "keep" | "promote" | "deprecate";

export interface AdminPageEntry {
  id: string;
  route: string;
  displayName: string;
  domain: string;
  tabCount: number;
  dataSources: string[];
  lastMeaningfulUpdate: string | null;
  estimatedUsageFrequency: "daily" | "weekly" | "monthly" | "rarely" | "never";
  overlapsWith: string[];
  consolidationScore: number; // 0-100, higher = more likely to consolidate
}

export interface ConsolidationRecommendation {
  sourceId: string;
  sourceRoute: string;
  action: ConsolidationAction;
  targetId: string | null;
  targetRoute: string | null;
  reason: string;
  impactLevel: "low" | "medium" | "high";
  remappedRoute: string | null;
  tabsToMerge: string[];
  breakingChange: boolean;
}

export interface RouteRemap {
  oldRoute: string;
  newRoute: string;
  redirectType: "permanent" | "temporary" | "removed";
  affectedTabs: string[];
}

// ── Admin page inventory ───────────────────────────────────────

export const ADMIN_PAGE_INVENTORY: AdminPageEntry[] = [
  { id: "ai-engineer-hub", route: "/admin/ai-engineer-hub", displayName: "AI Engineer Hub", domain: "ai-workforce", tabCount: AI_ENGINEER_HUB_TABS.length, dataSources: [...new Set(AI_ENGINEER_HUB_TABS.flatMap(t => t.dataSources.map(d => d.table).filter(Boolean) as string[]))], lastMeaningfulUpdate: "2026-04-20", estimatedUsageFrequency: "daily", overlapsWith: ["ai-runtime-dashboard"], consolidationScore: 15 },
  { id: "ai-runtime-dashboard", route: "/admin/ai-runtime", displayName: "AI Runtime Dashboard", domain: "ai-runtime", tabCount: 6, dataSources: ["ai_invocations", "ai_usage_ledger", "ai_provider_health"], lastMeaningfulUpdate: "2026-04-18", estimatedUsageFrequency: "daily", overlapsWith: ["ai-engineer-hub"], consolidationScore: 25 },
  { id: "health-dashboard", route: "/admin/health", displayName: "Health Dashboard", domain: "operations", tabCount: 8, dataSources: ["ai_provider_health", "platform_health_snapshots"], lastMeaningfulUpdate: "2026-04-19", estimatedUsageFrequency: "daily", overlapsWith: [], consolidationScore: 5 },
  { id: "alerts-center", route: "/admin/alerts", displayName: "Alerts Center", domain: "operations", tabCount: 4, dataSources: ["ai_budget_alerts", "ai_runtime_failure_alerts"], lastMeaningfulUpdate: "2026-04-17", estimatedUsageFrequency: "daily", overlapsWith: ["health-dashboard"], consolidationScore: 30 },
  { id: "verification-center", route: "/admin/verification", displayName: "Verification Center", domain: "governance", tabCount: 5, dataSources: ["security_fabric_probe_results"], lastMeaningfulUpdate: "2026-04-16", estimatedUsageFrequency: "weekly", overlapsWith: [], consolidationScore: 10 },
  { id: "trust-security", route: "/admin/trust-security", displayName: "Trust & Security", domain: "security", tabCount: 6, dataSources: ["admin_sessions", "user_roles"], lastMeaningfulUpdate: "2026-04-15", estimatedUsageFrequency: "weekly", overlapsWith: ["verification-center"], consolidationScore: 35 },
  { id: "release-center", route: "/admin/releases", displayName: "Release Center", domain: "deployment", tabCount: 4, dataSources: ["deployment_readiness_gates"], lastMeaningfulUpdate: "2026-04-14", estimatedUsageFrequency: "weekly", overlapsWith: [], consolidationScore: 10 },
  { id: "config-center", route: "/admin/config", displayName: "Configuration Center", domain: "platform", tabCount: 7, dataSources: ["feature_flags", "platform_config"], lastMeaningfulUpdate: "2026-04-13", estimatedUsageFrequency: "monthly", overlapsWith: [], consolidationScore: 15 },
  { id: "support-center", route: "/admin/support", displayName: "Support Center", domain: "support", tabCount: 5, dataSources: ["support_cases", "support_case_events"], lastMeaningfulUpdate: "2026-04-12", estimatedUsageFrequency: "daily", overlapsWith: [], consolidationScore: 5 },
  { id: "approvals-queue", route: "/admin/approvals", displayName: "Approvals Queue", domain: "governance", tabCount: 3, dataSources: ["admin_action_confirmations", "ai_workforce_approval_queue"], lastMeaningfulUpdate: "2026-04-11", estimatedUsageFrequency: "daily", overlapsWith: [], consolidationScore: 5 },
  { id: "environments-panel", route: "/admin/environments", displayName: "Environments Panel", domain: "deployment", tabCount: 3, dataSources: ["cloud_tenants", "tenant_federation_state"], lastMeaningfulUpdate: "2026-04-10", estimatedUsageFrequency: "monthly", overlapsWith: ["release-center"], consolidationScore: 40 },
  { id: "integrations-panel", route: "/admin/integrations", displayName: "Integrations Panel", domain: "platform", tabCount: 4, dataSources: ["connector_registry", "connector_reauth_events"], lastMeaningfulUpdate: "2026-04-09", estimatedUsageFrequency: "monthly", overlapsWith: [], consolidationScore: 20 },
];

// ── Consolidation analysis ─────────────────────────────────────

export function analyzeConsolidation(): ConsolidationRecommendation[] {
  const recommendations: ConsolidationRecommendation[] = [];

  for (const page of ADMIN_PAGE_INVENTORY) {
    // High consolidation score + overlaps → merge candidate
    if (page.consolidationScore >= 35 && page.overlapsWith.length > 0) {
      const target = ADMIN_PAGE_INVENTORY.find(p => p.id === page.overlapsWith[0]);
      if (target && target.consolidationScore < page.consolidationScore) {
        recommendations.push({
          sourceId: page.id,
          sourceRoute: page.route,
          action: "merge",
          targetId: target.id,
          targetRoute: target.route,
          reason: `${page.displayName} overlaps significantly with ${target.displayName} (shared data sources, similar domain). Merge tabs into the more-used surface.`,
          impactLevel: "medium",
          remappedRoute: target.route,
          tabsToMerge: [],
          breakingChange: true,
        });
      }
    }

    // Rarely used + low tab count → archive candidate
    if ((page.estimatedUsageFrequency === "rarely" || page.estimatedUsageFrequency === "never") && page.tabCount <= 3) {
      recommendations.push({
        sourceId: page.id,
        sourceRoute: page.route,
        action: "archive",
        targetId: null,
        targetRoute: null,
        reason: `${page.displayName} is rarely used with only ${page.tabCount} tabs. Archive and make accessible via search only.`,
        impactLevel: "low",
        remappedRoute: null,
        tabsToMerge: [],
        breakingChange: false,
      });
    }

    // Monthly usage + overlaps → deprecate candidate
    if (page.estimatedUsageFrequency === "monthly" && page.overlapsWith.length > 0) {
      const target = ADMIN_PAGE_INVENTORY.find(p => p.id === page.overlapsWith[0]);
      recommendations.push({
        sourceId: page.id,
        sourceRoute: page.route,
        action: "deprecate",
        targetId: target?.id ?? null,
        targetRoute: target?.route ?? null,
        reason: `${page.displayName} used monthly and overlaps with ${target?.displayName ?? "other pages"}. Deprecate in favor of consolidated view.`,
        impactLevel: "low",
        remappedRoute: target?.route ?? null,
        tabsToMerge: [],
        breakingChange: false,
      });
    }
  }

  return recommendations;
}

// ── Route remap generation ─────────────────────────────────────

export function generateRouteRemaps(recommendations: ConsolidationRecommendation[]): RouteRemap[] {
  return recommendations
    .filter(r => r.remappedRoute && r.action !== "keep")
    .map(r => ({
      oldRoute: r.sourceRoute,
      newRoute: r.remappedRoute!,
      redirectType: r.action === "merge" ? "permanent" as const : r.action === "archive" ? "removed" as const : "temporary" as const,
      affectedTabs: r.tabsToMerge,
    }));
}

// ── Full report ────────────────────────────────────────────────

export interface ConsolidationReport {
  generatedAt: string;
  totalAdminPages: number;
  recommendations: ConsolidationRecommendation[];
  routeRemaps: RouteRemap[];
  mergeCount: number;
  archiveCount: number;
  deprecateCount: number;
  keepCount: number;
}

export function generateConsolidationReport(): ConsolidationReport {
  const recommendations = analyzeConsolidation();
  const remaps = generateRouteRemaps(recommendations);
  
  return {
    generatedAt: new Date().toISOString(),
    totalAdminPages: ADMIN_PAGE_INVENTORY.length,
    recommendations,
    routeRemaps: remaps,
    mergeCount: recommendations.filter(r => r.action === "merge").length,
    archiveCount: recommendations.filter(r => r.action === "archive").length,
    deprecateCount: recommendations.filter(r => r.action === "deprecate").length,
    keepCount: ADMIN_PAGE_INVENTORY.length - recommendations.length,
  };
}