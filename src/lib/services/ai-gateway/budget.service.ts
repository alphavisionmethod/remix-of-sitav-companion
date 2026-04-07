// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Budget & Cost Service
// Supabase-backed: budget policies, usage ledger, alerts, cost
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type {
  AICostLedger, AITokenUsage, AIPortfolioAllocation,
  AIBudgetSummary, AIBudgetPolicy, AIUsageLedger, AIBudgetAlert,
} from "./types";

// ── Budget Policies (canonical) ────────────────────────────────
export async function getBudgetPolicies(): Promise<AIBudgetPolicy[]> {
  const { data, error } = await supabase
    .from("ai_budget_policies")
    .select("*")
    .order("scope_type");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveBudgetPolicies(): Promise<AIBudgetPolicy[]> {
  const { data, error } = await supabase
    .from("ai_budget_policies")
    .select("*")
    .eq("is_active", true)
    .order("scope_type");
  if (error) throw error;
  return data ?? [];
}

// ── Budget Alerts ──────────────────────────────────────────────
export async function getBudgetAlerts(): Promise<AIBudgetAlert[]> {
  const { data, error } = await supabase
    .from("ai_budget_alerts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveAlerts(): Promise<AIBudgetAlert[]> {
  const { data, error } = await supabase
    .from("ai_budget_alerts")
    .select("*")
    .in("alert_state", ["warning", "critical"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Usage Ledger (canonical) ───────────────────────────────────
export async function getUsageLedger(limit = 100): Promise<AIUsageLedger[]> {
  const { data, error } = await supabase
    .from("ai_usage_ledger")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Cost Ledger (legacy) ───────────────────────────────────────
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

// ── Token Usage (legacy) ───────────────────────────────────────
export async function getTokenUsage(limit = 100): Promise<AITokenUsage[]> {
  const { data, error } = await supabase
    .from("ai_token_usage")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Portfolio Allocations ──────────────────────────────────────
export async function getPortfolioAllocations(): Promise<AIPortfolioAllocation[]> {
  const { data, error } = await supabase
    .from("ai_portfolio_allocations")
    .select("*")
    .order("priority", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Budget Summary (unified) ───────────────────────────────────
export async function getBudgetSummary(): Promise<AIBudgetSummary> {
  const [allocations, costs, policies, alerts] = await Promise.all([
    getPortfolioAllocations(),
    getCostByProvider(),
    getBudgetPolicies(),
    getActiveAlerts(),
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
    alertCount: alerts.length,
    policies,
    alerts,
  };
}

