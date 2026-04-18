// ═══════════════════════════════════════════════════════════════
// SITA OS — Performance Budgets (Phase 20.B)
// Declares budgets and records breaches so observability can
// surface SLO burn signals.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface PerfBudget {
  readonly id: string;
  readonly description: string;
  readonly thresholdMs: number;
}

export const PERF_BUDGETS: PerfBudget[] = [
  { id: "page-load", description: "Initial page load TTI", thresholdMs: 3000 },
  { id: "route-transition", description: "Client-side route change", thresholdMs: 800 },
  { id: "fetch-p95", description: "Fetch p95 latency", thresholdMs: 1500 },
  { id: "command-palette", description: "Command palette response", thresholdMs: 200 },
];

export interface BudgetBreach {
  budgetId: string;
  observedMs: number;
  thresholdMs: number;
  context: Record<string, string | number>;
}

const breachQueue: BudgetBreach[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function recordBudgetBreach(breach: BudgetBreach) {
  breachQueue.push(breach);
  if (breachQueue.length >= 10) flushBreaches();
  else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushBreaches();
    }, 5000);
  }
}

async function flushBreaches() {
  if (breachQueue.length === 0) return;
  const batch = breachQueue.splice(0, breachQueue.length);
  try {
    await supabase.functions.invoke("alert-ingest", {
      body: {
        alerts: batch.map((b) => ({
          source: "perf-budget",
          severity: b.observedMs > b.thresholdMs * 2 ? "high" : "medium",
          subsystem: "frontend",
          fingerprint: `perf-budget:${b.budgetId}`,
          title: `Perf budget breach: ${b.budgetId}`,
          description: `Observed ${b.observedMs}ms (threshold ${b.thresholdMs}ms)`,
          metadata: { ...b.context, observedMs: b.observedMs, thresholdMs: b.thresholdMs },
        })),
      },
    });
  } catch {
    // Drop silently
  }
}

export function checkBudget(budgetId: string, observedMs: number, context: Record<string, string | number> = {}) {
  const budget = PERF_BUDGETS.find((b) => b.id === budgetId);
  if (!budget) return;
  if (observedMs > budget.thresholdMs) {
    recordBudgetBreach({ budgetId, observedMs, thresholdMs: budget.thresholdMs, context });
  }
}
