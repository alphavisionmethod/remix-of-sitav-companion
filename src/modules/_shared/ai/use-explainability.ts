// ═══════════════════════════════════════════════════════════════════
// SITA OS — useExplainability (Phase 4)
// Reads ai_invocation_plans + ai_explainability_traces for one
// invocation, so any UI can render "what was used to answer this?"
// ═══════════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromDynamicTable } from "@/lib/supabase-helpers";

export interface ExplainabilityTraceRow {
  id: string;
  invocation_id: string;
  source_type: string;
  source_id: string | null;
  source_label: string;
  weight: number;
  role: string;
  excerpt: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface InvocationPlanRow {
  id: string;
  correlation_id: string;
  workspace_id: string | null;
  module_id: string | null;
  mode: string;
  capability_key: string | null;
  model_choice: string | null;
  status: string;
  blocked_reason: string | null;
  receipt_id: string | null;
  inference_receipt_id: string | null;
  latency_ms: number | null;
  total_tokens: number | null;
  estimated_cost_usd: number | null;
  authority_check: Record<string, unknown> | null;
  context_sources: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export const EXPLAINABILITY_QUERY_KEY = ["ai-explainability"] as const;

export function useInvocationPlan(invocationId: string | null | undefined) {
  return useQuery({
    queryKey: [...EXPLAINABILITY_QUERY_KEY, "plan", invocationId],
    enabled: !!invocationId,
    queryFn: async (): Promise<InvocationPlanRow | null> => {
      if (!invocationId) return null;
      const { data, error } = await fromDynamicTable("ai_invocation_plans")
        .select("*")
        .eq("id", invocationId)
        .maybeSingle();
      if (error) {
        console.error("[useInvocationPlan]", error);
        return null;
      }
      return (data as InvocationPlanRow | null) ?? null;
    },
  });
}

export function useExplainabilityTraces(invocationId: string | null | undefined) {
  return useQuery({
    queryKey: [...EXPLAINABILITY_QUERY_KEY, "traces", invocationId],
    enabled: !!invocationId,
    queryFn: async (): Promise<ExplainabilityTraceRow[]> => {
      if (!invocationId) return [];
      const { data, error } = await fromDynamicTable("ai_explainability_traces")
        .select("*")
        .eq("invocation_id", invocationId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("[useExplainabilityTraces]", error);
        return [];
      }
      return (data as ExplainabilityTraceRow[]) ?? [];
    },
  });
}

export function useRecentInvocations(limit = 25) {
  return useQuery({
    queryKey: [...EXPLAINABILITY_QUERY_KEY, "recent", limit],
    queryFn: async (): Promise<InvocationPlanRow[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await fromDynamicTable("ai_invocation_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) {
        console.error("[useRecentInvocations]", error);
        return [];
      }
      return (data as InvocationPlanRow[]) ?? [];
    },
  });
}