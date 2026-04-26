// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Impact Playbook Breakdown (DEMO FIXTURE)
//
// These rows are demo-only. They are ONLY consumed by
// `RevenueImpactDashboard.tsx` when reality mode reports
// `isDemo === true`. Live mode derives KPIs from real paid invoices
// and renders an honest empty state when no data exists.
// See `src/data/fixtures/mock-data/_demo-source-marker.ts`.
// ═══════════════════════════════════════════════════════════════

export type PlaybookCategory = "recovery" | "growth" | "retention" | "efficiency";

export interface RevenueImpactPlaybookFixture {
  id: string;
  name: string;
  category: PlaybookCategory;
  recovered: number;
  generated: number;
  actionsRun: number;
  successRate: number;
  roi: number;
  trend: number;
}

export const REVENUE_IMPACT_PLAYBOOKS: ReadonlyArray<RevenueImpactPlaybookFixture> = [
  { id: "pb-recover-overdue",     name: "Recover overdue invoices",     category: "recovery",  recovered: 42_300, generated:      0, actionsRun: 38, successRate: 71, roi:  940, trend:  12 },
  { id: "pb-winback-cold-leads",  name: "Win back cold leads",          category: "growth",    recovered:      0, generated: 28_900, actionsRun: 64, successRate: 58, roi:  720, trend:   8 },
  { id: "pb-retain-churn-risk",   name: "Retain at-risk customers",     category: "retention", recovered: 19_500, generated:  6_400, actionsRun: 22, successRate: 79, roi: 1180, trend:  -3 },
  { id: "pb-collect-deposits",    name: "Collect outstanding deposits", category: "recovery",  recovered: 11_200, generated:      0, actionsRun: 15, successRate: 83, roi:  990, trend:   5 },
] as const;