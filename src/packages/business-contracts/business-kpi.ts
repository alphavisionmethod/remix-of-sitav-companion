// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Business KPI
// ═══════════════════════════════════════════════════════════════

export type KPITrend = "improving" | "stable" | "declining" | "volatile";

export interface BusinessKPI {
  id: string;
  metricName: string;
  currentValue: number;
  previousValue: number;
  trend: KPITrend;
  unit: string;
  periodStart: string;
  periodEnd: string;
  target?: number;
  threshold?: { warning: number; critical: number };
  domain: string;
}
