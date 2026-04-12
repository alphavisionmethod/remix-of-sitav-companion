// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Budget & Usage React Query Hooks
// Wraps budget.service.ts for UI consumption
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import {
  getBudgetPolicies,
  getActiveBudgetPolicies,
  getBudgetAlerts,
  getBudgetSummary,
  getUsageLedger,
} from "@/lib/services/ai-gateway/budget.service";
import { toast } from "sonner";

export function useBudgetPolicies() {
  return useQuery({
    queryKey: ["ai-budget-policies"],
    queryFn: getBudgetPolicies,
  });
}

export function useActiveBudgetPolicies() {
  return useQuery({
    queryKey: ["ai-budget-policies-active"],
    queryFn: getActiveBudgetPolicies,
  });
}

export function useBudgetAlerts() {
  return useQuery({
    queryKey: ["ai-budget-alerts"],
    queryFn: getBudgetAlerts,
  });
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: ["ai-budget-summary"],
    queryFn: getBudgetSummary,
  });
}

export function useUsageLedger(limit = 200) {
  return useQuery({
    queryKey: ["ai-usage-ledger", limit],
    queryFn: () => getUsageLedger(limit),
  });
}

export function useDailyAggregation() {
  return useQuery({
    queryKey: ["ai-daily-aggregation"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await ( supabase as any).rpc("aggregate_ai_daily_spend" as any, {
        p_user_id: user.id,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateBudgetPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (policy: {
      policy_key: string;
      scope_type?: string;
      scope_ref?: string;
      daily_budget_usd?: number;
      weekly_budget_usd?: number;
      monthly_budget_usd?: number;
      max_request_cost_usd?: number;
      max_daily_requests?: number;
      premium_allowed?: boolean;
      fallback_on_exceeded?: boolean;
      block_on_exceeded?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("ai_budget_policies").insert({
        ...policy,
        user_id: user.id,
        scope_type: policy.scope_type || "global",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-budget-policies"] });
      qc.invalidateQueries({ queryKey: ["ai-budget-summary"] });
      toast.success("Budget policy created");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdateBudgetPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_active?: boolean; daily_budget_usd?: number; monthly_budget_usd?: number }) => {
      const { error } = await fromTable("ai_budget_policies").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-budget-policies"] });
      qc.invalidateQueries({ queryKey: ["ai-budget-summary"] });
      toast.success("Budget policy updated");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useDeleteBudgetPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("ai_budget_policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-budget-policies"] });
      qc.invalidateQueries({ queryKey: ["ai-budget-summary"] });
      toast.success("Budget policy deleted");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}
