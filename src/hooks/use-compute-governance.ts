// ═══════════════════════════════════════════════════════════════
// SITA OS — Compute Governance React Hooks
// Real DB queries for budget status, spend, margin, fair use, routing
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  calculateMargin, detectAnomalies, evaluateFairUse,
  PLANS, getPlanByTier,
} from "@/lib/compute-governance";
import type {
  PlanTier, BudgetStatus, MarginSnapshot, FairUseEvaluation,
} from "@/lib/compute-governance";

// ── Types ───────────────────────────────────────────────────

export interface ComputeBudgetHealth {
  totalBudgetCents: number;
  totalSpentCents: number;
  utilizationPct: number;
  status: BudgetStatus;
  dailySpentCents: number;
  weeklySpentCents: number;
  monthlySpentCents: number;
  activePolicies: number;
  blockedCapabilities: string[];
}

export interface AISpendRow {
  spend_date: string;
  capability_key: string;
  request_count: number;
  total_cost_usd: number;
  total_tokens: number;
  avg_latency_ms: number;
}

export interface ModelRoutingStat {
  model: string;
  provider: string;
  request_count: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_latency_ms: number;
}

export interface LiveMarginSnapshot {
  revenueCents: number;
  aiCostCents: number;
  infraCostCents: number;
  grossMarginPct: number;
  trend: MarginSnapshot["marginTrend"];
  topCostDrivers: Array<{ source: string; costCents: number; pctOfTotal: number }>;
  anomalyCount: number;
}

// ── Hook: Budget Status ─────────────────────────────────────

export function useComputeBudgetStatus() {
  const { isDemoMode } = useDataMode();

  return useQuery<ComputeBudgetHealth>({
    queryKey: ["compute-budget-status", isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<ComputeBudgetHealth> => {
      if (isDemoMode) {
        return {
          totalBudgetCents: 15000,
          totalSpentCents: 9800,
          utilizationPct: 65,
          status: "approaching" as BudgetStatus,
          dailySpentCents: 420,
          weeklySpentCents: 2800,
          monthlySpentCents: 9800,
          activePolicies: 4,
          blockedCapabilities: [],
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get budget
      const { data: budgets } = await fromDynamicTable("user_ai_budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("period", "monthly");

      const budget = budgets?.[0];
      const totalBudget = budget?.limit_cost_cents ?? 15000;
      const totalSpent = budget?.used_cost_cents ?? 0;

      // Get daily spend
      const today = new Date().toISOString().split("T")[0];
      const { data: dailyLedger } = await fromDynamicTable("ai_usage_ledger")
        .select("estimated_cost_usd")
        .eq("user_id", user.id)
        .gte("created_at", today);

      const dailySpent = Math.round((dailyLedger || []).reduce((s: number, r: any) => s + (r.estimated_cost_usd || 0), 0) * 100);

      // Get active policies count
      const { count: policyCount } = await fromDynamicTable("ai_budget_policies")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const utilPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      let status: BudgetStatus = "healthy";
      if (utilPct >= 100) status = "exceeded";
      else if (utilPct >= 90) status = "warning";
      else if (utilPct >= 75) status = "approaching";

      return {
        totalBudgetCents: totalBudget,
        totalSpentCents: totalSpent,
        utilizationPct: utilPct,
        status,
        dailySpentCents: dailySpent,
        weeklySpentCents: totalSpent, // simplified
        monthlySpentCents: totalSpent,
        activePolicies: policyCount ?? 0,
        blockedCapabilities: [],
      };
    },
    staleTime: isDemoMode ? Infinity : 30_000,
    refetchOnWindowFocus: !isDemoMode,
  });
}

// ── Hook: AI Spend Summary ──────────────────────────────────

export function useAISpendSummary() {
  const { isDemoMode } = useDataMode();

  return useQuery<AISpendRow[]>({
    queryKey: ["ai-spend-summary", isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<AISpendRow[]> => {
      if (isDemoMode) {
        return [
          { spend_date: new Date().toISOString().split("T")[0], capability_key: "advisor-chat", request_count: 42, total_cost_usd: 0.84, total_tokens: 128000, avg_latency_ms: 1200 },
          { spend_date: new Date().toISOString().split("T")[0], capability_key: "monitoring", request_count: 320, total_cost_usd: 0.32, total_tokens: 64000, avg_latency_ms: 200 },
          { spend_date: new Date().toISOString().split("T")[0], capability_key: "self-healing", request_count: 8, total_cost_usd: 1.20, total_tokens: 48000, avg_latency_ms: 3400 },
          { spend_date: new Date().toISOString().split("T")[0], capability_key: "boardroom", request_count: 3, total_cost_usd: 2.10, total_tokens: 92000, avg_latency_ms: 5200 },
          { spend_date: new Date().toISOString().split("T")[0], capability_key: "engineering", request_count: 12, total_cost_usd: 1.80, total_tokens: 76000, avg_latency_ms: 4100 },
        ];
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("aggregate_ai_daily_spend", { p_user_id: user.id });
      if (error) throw error;
      return (data || []) as AISpendRow[];
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });
}

// ── Hook: Model Routing Stats ───────────────────────────────

export function useModelRoutingStats() {
  const { isDemoMode } = useDataMode();

  return useQuery<ModelRoutingStat[]>({
    queryKey: ["model-routing-stats", isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<ModelRoutingStat[]> => {
      if (isDemoMode) {
        return [
          { model: "gemini-3-flash-preview", provider: "google", request_count: 280, total_tokens: 420000, total_cost_usd: 0.42, avg_latency_ms: 180 },
          { model: "gpt-4o-mini", provider: "openai", request_count: 85, total_tokens: 170000, total_cost_usd: 0.51, avg_latency_ms: 320 },
          { model: "claude-sonnet-4", provider: "anthropic", request_count: 15, total_tokens: 92000, total_cost_usd: 2.76, avg_latency_ms: 2100 },
          { model: "structured-state", provider: "local", request_count: 450, total_tokens: 0, total_cost_usd: 0, avg_latency_ms: 5 },
        ];
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await fromDynamicTable("ai_usage_ledger")
        .select("model_id, provider_id, estimated_cost_usd, total_tokens, latency_ms")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

      if (!data || data.length === 0) return [];

      // Aggregate by model
      const byModel: Record<string, ModelRoutingStat> = {};
      for (const row of data) {
        const key = row.model_id || "unknown";
        if (!byModel[key]) {
          byModel[key] = { model: key, provider: row.provider_id || "unknown", request_count: 0, total_tokens: 0, total_cost_usd: 0, avg_latency_ms: 0 };
        }
        byModel[key].request_count++;
        byModel[key].total_tokens += row.total_tokens || 0;
        byModel[key].total_cost_usd += row.estimated_cost_usd || 0;
        byModel[key].avg_latency_ms += row.latency_ms || 0;
      }

      return Object.values(byModel).map(m => ({
        ...m,
        avg_latency_ms: m.request_count > 0 ? Math.round(m.avg_latency_ms / m.request_count) : 0,
      })).sort((a, b) => b.total_cost_usd - a.total_cost_usd);
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });
}

// ── Hook: Live Margin Snapshot ──────────────────────────────

export function useMarginSnapshot(planTier: PlanTier = "pro") {
  const { isDemoMode } = useDataMode();

  return useQuery<LiveMarginSnapshot>({
    queryKey: ["margin-snapshot", planTier, isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<LiveMarginSnapshot> => {
      const plan = getPlanByTier(planTier);
      const revenueCents = plan?.monthlyPriceCents ?? 14900;

      if (isDemoMode) {
        const aiCostCents = 4200;
        const infraCostCents = 800;
        const { grossMarginPct, trend } = calculateMargin(revenueCents, aiCostCents, infraCostCents);
        return {
          revenueCents,
          aiCostCents,
          infraCostCents,
          grossMarginPct,
          trend,
          topCostDrivers: [
            { source: "Advisor Chat", costCents: 1800, pctOfTotal: 43 },
            { source: "Engineering Agents", costCents: 1200, pctOfTotal: 29 },
            { source: "Monitoring", costCents: 600, pctOfTotal: 14 },
            { source: "Self-Healing", costCents: 600, pctOfTotal: 14 },
          ],
          anomalyCount: 2,
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: ledger } = await fromDynamicTable("ai_usage_ledger")
        .select("estimated_cost_usd, capability_key")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

      const aiCostCents = Math.round((ledger || []).reduce((s: number, r: any) => s + (r.estimated_cost_usd || 0), 0) * 100);
      const infraCostCents = Math.round(aiCostCents * 0.15); // estimate

      const { grossMarginPct, trend } = calculateMargin(revenueCents, aiCostCents, infraCostCents);

      // Group by capability
      const byCap: Record<string, number> = {};
      for (const r of ledger || []) {
        const key = r.capability_key || "other";
        byCap[key] = (byCap[key] || 0) + Math.round((r.estimated_cost_usd || 0) * 100);
      }

      const totalCost = aiCostCents + infraCostCents;
      const topCostDrivers = Object.entries(byCap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, costCents]) => ({
          source,
          costCents,
          pctOfTotal: totalCost > 0 ? Math.round((costCents / totalCost) * 100) : 0,
        }));

      return { revenueCents, aiCostCents, infraCostCents, grossMarginPct, trend, topCostDrivers, anomalyCount: 0 };
    },
    staleTime: isDemoMode ? Infinity : 60_000,
  });
}

// ── Hook: Fair Use Status ───────────────────────────────────

export function useFairUseStatus(planTier: PlanTier = "pro") {
  const { isDemoMode } = useDataMode();

  return useQuery<FairUseEvaluation>({
    queryKey: ["fair-use-status", planTier, isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<FairUseEvaluation> => {
      if (isDemoMode) {
        return evaluateFairUse(planTier, {
          deepReasoningMinutesUsed: 35,
          premiumEscalationsUsed: 4,
          asyncHighComputeJobsUsed: 1,
          dailyBurstCentsUsed: 80,
          totalComputeCentsUsed: 8500,
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: ledger } = await fromDynamicTable("ai_usage_ledger")
        .select("estimated_cost_usd, task_class")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

      const totalCents = Math.round((ledger || []).reduce((s: number, r: any) => s + (r.estimated_cost_usd || 0), 0) * 100);
      const premiumCount = (ledger || []).filter((r: any) => r.task_class === "premium_reasoning" || r.task_class === "deep_analysis").length;

      return evaluateFairUse(planTier, {
        deepReasoningMinutesUsed: Math.round(premiumCount * 3),
        premiumEscalationsUsed: premiumCount,
        asyncHighComputeJobsUsed: 0,
        dailyBurstCentsUsed: 0,
        totalComputeCentsUsed: totalCents,
      });
    },
    staleTime: isDemoMode ? Infinity : 60_000,
  });
}
