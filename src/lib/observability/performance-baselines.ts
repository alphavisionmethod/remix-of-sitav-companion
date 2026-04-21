// ═══════════════════════════════════════════════════════════════
// SITA OS — Performance Baselines
// Defines metrics to track and measurement hooks
// ═══════════════════════════════════════════════════════════════

export interface PerformanceMetric {
  id: string;
  name: string;
  category: "route" | "edge-function" | "ai" | "workflow" | "infrastructure";
  unit: "ms" | "s" | "percent" | "count";
  targetP50: number;
  targetP95: number;
  targetP99: number;
  currentBaseline: number | null; // null = not yet measured
  measuredAt: string | null;
}

export const PERFORMANCE_BASELINES: PerformanceMetric[] = [
  { id: "PM-001", name: "Homepage Load (TTI)", category: "route", unit: "ms", targetP50: 1500, targetP95: 3000, targetP99: 5000, currentBaseline: null, measuredAt: null },
  { id: "PM-002", name: "Admin Dashboard Load", category: "route", unit: "ms", targetP50: 2000, targetP95: 4000, targetP99: 6000, currentBaseline: null, measuredAt: null },
  { id: "PM-003", name: "Auth Login Flow", category: "route", unit: "ms", targetP50: 800, targetP95: 2000, targetP99: 3000, currentBaseline: null, measuredAt: null },
  { id: "PM-004", name: "Edge Function: chat-advisor", category: "edge-function", unit: "ms", targetP50: 500, targetP95: 2000, targetP99: 5000, currentBaseline: null, measuredAt: null },
  { id: "PM-005", name: "Edge Function: boardroom-session", category: "edge-function", unit: "ms", targetP50: 800, targetP95: 3000, targetP99: 6000, currentBaseline: null, measuredAt: null },
  { id: "PM-006", name: "Edge Function: alert-ingest", category: "edge-function", unit: "ms", targetP50: 200, targetP95: 500, targetP99: 1000, currentBaseline: null, measuredAt: null },
  { id: "PM-007", name: "AI Chat Response (E2E)", category: "ai", unit: "ms", targetP50: 1500, targetP95: 3000, targetP99: 5000, currentBaseline: null, measuredAt: null },
  { id: "PM-008", name: "AI Fallback Trigger", category: "ai", unit: "ms", targetP50: 200, targetP95: 500, targetP99: 1000, currentBaseline: null, measuredAt: null },
  { id: "PM-009", name: "Workflow Step Execution", category: "workflow", unit: "ms", targetP50: 300, targetP95: 1000, targetP99: 3000, currentBaseline: null, measuredAt: null },
  { id: "PM-010", name: "Kill Switch Actuation", category: "infrastructure", unit: "ms", targetP50: 1000, targetP95: 5000, targetP99: 30000, currentBaseline: null, measuredAt: null },
  { id: "PM-011", name: "Cold Start (Edge Function)", category: "infrastructure", unit: "ms", targetP50: 300, targetP95: 800, targetP99: 2000, currentBaseline: null, measuredAt: null },
  { id: "PM-012", name: "Document Download (Deal Room)", category: "route", unit: "ms", targetP50: 500, targetP95: 2000, targetP99: 5000, currentBaseline: null, measuredAt: null },
];

export function getUnmeasuredMetrics(): PerformanceMetric[] {
  return PERFORMANCE_BASELINES.filter((m) => m.currentBaseline === null);
}

export function recordBaseline(id: string, valueMs: number): void {
  const metric = PERFORMANCE_BASELINES.find((m) => m.id === id);
  if (metric) {
    metric.currentBaseline = valueMs;
    metric.measuredAt = new Date().toISOString();
  }
}