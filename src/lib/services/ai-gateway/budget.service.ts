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

// ── Usage Ledger Stats (canonical analytics) ──────────────────
export interface UsageLedgerStats {
  spendByCapability: Record<string, number>;
  spendByModel: Record<string, number>;
  premiumCount: number;
  economyCount: number;
  blockedCount: number;
  fallbackCount: number;
  failedCount: number;
  totalToday: number;
  costToday: number;
}

export async function getUsageLedgerStats(): Promise<UsageLedgerStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("ai_usage_ledger")
    .select("capability_key, model_id, request_class, status, estimated_cost_usd")
    .gte("created_at", todayStart.toISOString());
  if (error) throw error;

  const rows = data ?? [];
  const stats: UsageLedgerStats = {
    spendByCapability: {},
    spendByModel: {},
    premiumCount: 0,
    economyCount: 0,
    blockedCount: 0,
    fallbackCount: 0,
    failedCount: 0,
    totalToday: rows.length,
    costToday: 0,
  };

  rows.forEach(r => {
    const cost = r.estimated_cost_usd ?? 0;
    stats.costToday += cost;
    stats.spendByCapability[r.capability_key] = (stats.spendByCapability[r.capability_key] ?? 0) + cost;
    const model = r.model_id ?? "unknown";
    stats.spendByModel[model] = (stats.spendByModel[model] ?? 0) + cost;
    if (r.request_class === "premium_synthesis") stats.premiumCount++;
    if (r.request_class === "economy_utility") stats.economyCount++;
    if (r.status === "blocked_budget") stats.blockedCount++;
    if (r.status === "fallback_success") stats.fallbackCount++;
    if (r.status === "error") stats.failedCount++;
  });

  return stats;
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

