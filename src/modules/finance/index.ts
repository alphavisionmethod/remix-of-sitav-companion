// ════════════════════════════════════════════════════════════
// Finance OS — Module Barrel
// ════════════════════════════════════════════════════════════

export const FINANCE_PILLAR = {
  id: "finance",
  label: "Finance OS",
  routePrefix: "/money",
  routeAliases: ["/finance"] as const,
  description: "Budget · Cash flow · Investments · Tax · Net Worth · Family Office",
} as const;

export type FinancePillar = typeof FINANCE_PILLAR;