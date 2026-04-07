// ═══════════════════════════════════════════════════════════════
// SITA OS — Sovereign AI Gateway Data Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

const makeHook = (table: string, key: string) => () => useQuery({
  queryKey: ['sag', key],
  queryFn: async () => {
    const { data, error } = await fromDynamicTable(table).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Record<string, unknown>[];
  }
});

const makeMutation = (table: string, key: string, successMsg: string) => () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: Record<string, unknown>) => {
      const user = await getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await fromDynamicTable(table).insert({ ...record, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sag'] }); toast.success(successMsg); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useModelRegistry = makeHook('ai_model_registry', 'models');
export const useCreateModel = makeMutation('ai_model_registry', 'models', 'Model registered');

export const usePromptFamilies = makeHook('ai_prompt_families', 'prompts');
export const useCreatePromptFamily = makeMutation('ai_prompt_families', 'prompts', 'Prompt family created');

export const useRoutingPolicies = makeHook('ai_routing_policies', 'routing');
export const useCreateRoutingPolicy = makeMutation('ai_routing_policies', 'routing', 'Routing policy created');

export const useTaskRequests = makeHook('ai_task_requests', 'tasks');
export const useInferenceReceipts = makeHook('ai_inference_receipts', 'receipts');

export const useProviderHealth = makeHook('ai_provider_health', 'health');
export const useCreateProviderHealth = makeMutation('ai_provider_health', 'health', 'Provider health updated');

export const usePortfolioAllocations = makeHook('ai_portfolio_allocations', 'portfolio');
export const useCreateAllocation = makeMutation('ai_portfolio_allocations', 'portfolio', 'Allocation created');

export const useComplianceViolations = makeHook('ai_compliance_violations', 'violations');

export const useEfficiencyScores = makeHook('ai_efficiency_scores', 'efficiency');
export const useSelfHealingRules = makeHook('ai_self_healing_rules', 'healing');
export const useCreateSelfHealingRule = makeMutation('ai_self_healing_rules', 'healing', 'Self-healing rule created');
export const useCostLedger = makeHook('ai_cost_ledger', 'cost-ledger');

// ─── Aggregated Stats ───
export const useGatewayStats = () => useQuery({
  queryKey: ['sag', 'stats'],
  queryFn: async () => {
    const [tasks, receipts, health, portfolio, violations] = await Promise.all([
      fromTable('ai_task_requests').select('*').order('created_at', { ascending: false }).limit(500),
      fromTable('ai_inference_receipts').select('*').order('created_at', { ascending: false }).limit(500),
      fromTable('ai_provider_health').select('*'),
      fromTable('ai_portfolio_allocations').select('*'),
      fromTable('ai_compliance_violations').select('*').eq('resolved', false),
    ]);
    const t = (tasks.data || []) as Record<string, unknown>[];
    const r = (receipts.data || []) as Record<string, unknown>[];
    const totalCost = t.reduce((s: number, x) => s + ((x.cost_actual_cents as number) || 0), 0);
    const cacheHits = t.filter((x) => x.cache_hit).length;
    const fallbacks = t.filter((x) => x.fallback_used).length;
    const providers: Record<string, number> = {};
    t.forEach((x) => { if (x.provider_chosen) providers[x.provider_chosen as string] = (providers[x.provider_chosen as string] || 0) + 1; });
    return {
      totalRequests: t.length, totalCost, cacheHitRate: t.length ? cacheHits / t.length : 0,
      fallbackRate: t.length ? fallbacks / t.length : 0, providers,
      receipts: r.length, healthRecords: (health.data || []).length,
      allocations: (portfolio.data || []).length, violations: (violations.data || []).length,
      premiumRate: t.length ? t.filter((x) => ((x.model_chosen as string) || '').includes('pro') || ((x.model_chosen as string) || '').includes('premium')).length / t.length : 0,
    };
  }
});