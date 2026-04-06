// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Budget & Cost Service
// Supabase-backed: cost ledger, token usage, portfolio allocations
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { AICostLedger, AITokenUsage, AIPortfolioAllocation, AIBudgetSummary } from "./types";

// ── Cost Ledger ────────────────────────────────────────────────
export async function getCostLedger(limit = 100): Promise<AICostLedger[]> {
  const { data, error } = await supabase
    .from("ai_cost_ledger")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getCostByProvider(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("ai_cost_ledger")
    .select("provider, cost_cents");
  if (error) throw error;
  const result: Record<string, number> = {};
  (data ?? []).forEach(d => {
    const p = d.provider ?? "unknown";
    result[p] = (result[p] ?? 0) + (d.cost_cents ?? 0);
  });
  return result;
}

// ── Token Usage ────────────────────────────────────────────────
export async function getTokenUsage(limit = 100): Promise<AITokenUsage[]> {
  const { data, error } = await supabase
    .from("ai_token_usage")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Portfolio Allocations (Budgets) ────────────────────────────
export async function getPortfolioAllocations(): Promise<AIPortfolioAllocation[]> {
  const { data, error } = await supabase
    .from("ai_portfolio_allocations")
    .select("*")
    .order("priority", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Budget Summary ─────────────────────────────────────────────
export async function getBudgetSummary(): Promise<AIBudgetSummary> {
  const [allocations, costs] = await Promise.all([
    getPortfolioAllocations(),
    getCostByProvider(),
  ]);

  const totalBudget = allocations.reduce((s, a) => s + (a.budget_cents ?? 0), 0);
  const totalSpent = allocations.reduce((s, a) => s + (a.spent_cents ?? 0), 0);
  const byTaskClass: Record<string, number> = {};
  allocations.forEach(a => {
    byTaskClass[a.allocation_class] = (byTaskClass[a.allocation_class] ?? 0) + (a.spent_cents ?? 0);
  });

  return {
    totalBudgetCents: totalBudget,
    totalSpentCents: totalSpent,
    utilizationPercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    byProvider: costs,
    byTaskClass,
    alertCount: 0,
  };
}
