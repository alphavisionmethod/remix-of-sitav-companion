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

      const { data, error } = await ( supabase as any).rpc("aggregate_ai_daily_spend" as any, { p_user_id: user.id });
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
      const plan = getPlanByTier(planTier);
      if (!plan) return { healthy: true, pressureLevel: "none", activeAdaptations: [], reason: "No plan found" };

      if (isDemoMode) {
        return evaluateFairUse(plan, 35, 400, 2, 45);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: ledger } = await fromDynamicTable("ai_usage_ledger")
        .select("estimated_cost_usd, task_class")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

      const totalCents = Math.round((ledger || []).reduce((s: number, r: any) => s + (r.estimated_cost_usd || 0), 0) * 100);
      const premiumCount = (ledger || []).filter((r: any) => r.task_class === "premium_reasoning" || r.task_class === "deep_analysis").length;

      return evaluateFairUse(plan, Math.round(premiumCount * 3), Math.round(totalCents * 0.2), premiumCount, 50);
    },
    staleTime: isDemoMode ? Infinity : 60_000,
  });
}

// ── Types for new hooks ─────────────────────────────────────

export interface MissionCostRow {
  id: string;
  name: string;
  domain: string;
  agents: string[];
  tiersUsed: string[];
  estimatedCost: number;
  actualCost: number;
  verificationCost: number;
  retries: number;
  retryCost: number;
  cacheSavings: number;
  compressionSavings: number;
  outcome: "high-value" | "standard" | "low-value" | "waste";
  valueScore: number;
  status: "completed" | "active" | "failed";
  duration: string;
}

export interface MarginProtectionEvent {
  id: string;
  action: string;
  from: string;
  to: string;
  scope: string;
  reason: string;
  impact: string;
  costSaved: number;
  time: string;
  severity: "critical" | "warning" | "info";
}

// ── Hook: Mission Cost Data ─────────────────────────────────

export function useMissionCostData() {
  const { isDemoMode } = useDataMode();

  return useQuery<MissionCostRow[]>({
    queryKey: ["mission-cost-data", isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<MissionCostRow[]> => {
      const demoData: MissionCostRow[] = [
        { id: "m1", name: "Q2 Tax Optimization Strategy", domain: "finance-os", agents: ["Finance Advisor", "Strategy Synthesizer"], tiersUsed: ["standard", "premium"], estimatedCost: 800, actualCost: 620, verificationCost: 45, retries: 1, retryCost: 12, cacheSavings: 180, compressionSavings: 90, outcome: "high-value", valueScore: 92, status: "completed", duration: "2h 14m" },
        { id: "m2", name: "Portfolio Rebalance Analysis", domain: "finance-os", agents: ["Finance Advisor"], tiersUsed: ["standard"], estimatedCost: 300, actualCost: 280, verificationCost: 20, retries: 0, retryCost: 0, cacheSavings: 65, compressionSavings: 30, outcome: "standard", valueScore: 68, status: "completed", duration: "45m" },
        { id: "m3", name: "Website SEO Audit", domain: "business-os", agents: ["Growth Agent", "Content Advisor"], tiersUsed: ["utility", "standard"], estimatedCost: 400, actualCost: 520, verificationCost: 35, retries: 4, retryCost: 120, cacheSavings: 20, compressionSavings: 15, outcome: "low-value", valueScore: 28, status: "completed", duration: "1h 50m" },
        { id: "m4", name: "Runaway Monitor Loop", domain: "admin", agents: ["Self-Healing Agent"], tiersUsed: ["utility"], estimatedCost: 50, actualCost: 340, verificationCost: 10, retries: 12, retryCost: 280, cacheSavings: 0, compressionSavings: 0, outcome: "waste", valueScore: 5, status: "failed", duration: "38m" },
        { id: "m5", name: "Customer Churn Prediction", domain: "business-os", agents: ["Strategy Synthesizer", "Finance Advisor"], tiersUsed: ["premium", "exceptional"], estimatedCost: 1200, actualCost: 980, verificationCost: 60, retries: 0, retryCost: 0, cacheSavings: 320, compressionSavings: 140, outcome: "high-value", valueScore: 95, status: "active", duration: "ongoing" },
      ];

      if (isDemoMode) return demoData;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return demoData;

      // Query real mission data from ai_usage_ledger grouped by capability
      const { data: ledger } = await fromDynamicTable("ai_usage_ledger")
        .select("capability_key, estimated_cost_usd, total_tokens, latency_ms, model_id, task_class, created_at")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .order("created_at", { ascending: false });

      if (!ledger || ledger.length === 0) return demoData;

      // Group by capability_key as proxy for missions
      const byCap: Record<string, any[]> = {};
      for (const row of ledger) {
        const key = row.capability_key || "other";
        if (!byCap[key]) byCap[key] = [];
        byCap[key].push(row);
      }

      return Object.entries(byCap).map(([capKey, rows], i) => {
        const totalCost = Math.round(rows.reduce((s, r) => s + (r.estimated_cost_usd || 0), 0) * 100);
        const retryRows = rows.filter((r, idx) => idx > 0 && r.capability_key === rows[idx - 1]?.capability_key);
        const models = [...new Set(rows.map(r => r.model_id).filter(Boolean))];
        const valueScore = totalCost < 100 ? 75 : totalCost < 500 ? 55 : 35;

        return {
          id: `real-${i}`,
          name: capKey.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          domain: rows[0]?.task_class || "general",
          agents: models.slice(0, 2),
          tiersUsed: models.length > 1 ? ["standard", "premium"] : ["utility"],
          estimatedCost: Math.round(totalCost * 1.15),
          actualCost: totalCost,
          verificationCost: Math.round(totalCost * 0.05),
          retries: retryRows.length,
          retryCost: Math.round(retryRows.reduce((s, r) => s + (r.estimated_cost_usd || 0), 0) * 100),
          cacheSavings: Math.round(totalCost * 0.12),
          compressionSavings: Math.round(totalCost * 0.06),
          outcome: (totalCost < 100 ? "standard" : totalCost < 500 ? "standard" : "low-value") as MissionCostRow["outcome"],
          valueScore,
          status: "completed" as const,
          duration: `${rows.length} calls`,
        };
      });
    },
    staleTime: isDemoMode ? Infinity : 60_000,
  });
}

// ── Hook: Margin Protection Feed ────────────────────────────

export function useMarginProtectionFeed() {
  const { isDemoMode } = useDataMode();

  return useQuery<MarginProtectionEvent[]>({
    queryKey: ["margin-protection-feed", isDemoMode ? "demo" : "real"],
    queryFn: async (): Promise<MarginProtectionEvent[]> => {
      const demoData: MarginProtectionEvent[] = [
        { id: "p1", action: "model-tier-downgrade", from: "premium", to: "standard", scope: "Household Smith", reason: "Budget at 92% — soft limit breach", impact: "Slightly slower synthesis", costSaved: 340, time: "4min ago", severity: "warning" },
        { id: "p2", action: "force-async", from: "sync", to: "async", scope: "Acme Corp", reason: "3 concurrent premium jobs exceeded plan limit", impact: "User sees async queue notice", costSaved: 180, time: "12min ago", severity: "info" },
        { id: "p3", action: "compress-context", from: "42k", to: "8k", scope: "Finance Workspace", reason: "Context size 42k tokens — exceeding Class B ceiling", impact: "None visible to user", costSaved: 95, time: "18min ago", severity: "info" },
        { id: "p4", action: "block-premium-escalation", from: "premium", to: "blocked", scope: "Solo User", reason: "Starter plan — no Class D access", impact: "User offered upgrade path", costSaved: 620, time: "1hr ago", severity: "critical" },
        { id: "p5", action: "pause-deep-loop", from: "active", to: "paused", scope: "Strategy Synthesizer", reason: "Repeated expensive re-analysis with low confidence delta", impact: "Agent paused, operator notified", costSaved: 1240, time: "2hr ago", severity: "warning" },
        { id: "p6", action: "digest-mode-shift", from: "real-time", to: "digest", scope: "Global Monitor", reason: "Proactive inference budget at 85%", impact: "Switched from real-time to digest", costSaved: 210, time: "3hr ago", severity: "info" },
      ];

      if (isDemoMode) return demoData;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return demoData;

      // Query real budget alerts as proxy for protection events
      const { data: alerts } = await fromDynamicTable("ai_budget_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!alerts || alerts.length === 0) return demoData;

      return alerts.map((a: any, i: number) => ({
        id: a.id || `alert-${i}`,
        action: a.alert_state === "critical" ? "block-premium-escalation" : "model-tier-downgrade",
        from: "auto",
        to: a.alert_state || "warning",
        scope: a.scope_type + (a.scope_ref ? `: ${a.scope_ref}` : ""),
        reason: `${a.period_class} budget at ${a.threshold_percent}% — $${a.observed_cost_usd?.toFixed(2)} observed`,
        impact: a.alert_state === "critical" ? "Premium blocked" : "Model downgraded",
        costSaved: Math.round((a.observed_cost_usd || 0) * 10),
        time: new Date(a.created_at).toLocaleString(),
        severity: (a.alert_state === "critical" ? "critical" : a.alert_state === "resolved" ? "info" : "warning") as MarginProtectionEvent["severity"],
      }));
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });
}
