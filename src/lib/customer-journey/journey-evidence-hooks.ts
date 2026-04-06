// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Journey Evidence Hooks
// Step results + evidence assets for verification runs
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Step Results ──

export function useStepResults(runId?: string) {
  return useQuery({
    queryKey: ["journey-step-results", runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await (supabase as any)
        .from("journey_step_results")
        .select("*")
        .eq("verification_run_id", runId)
        .order("step_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!runId,
  });
}

export function useRecordStepResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (step: {
      verification_run_id: string;
      journey_step_id?: string;
      step_order: number;
      status: string;
      actual_behavior?: string;
      error_summary?: string;
      screenshot_ref?: string;
      trace_ref?: string;
      duration_ms?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("journey_step_results")
        .insert({ ...step, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["journey-step-results", vars.verification_run_id] });
    },
  });
}

// ── Evidence Assets ──

export function useEvidenceAssets(runId?: string) {
  return useQuery({
    queryKey: ["verification-evidence-assets", runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await (supabase as any)
        .from("verification_evidence_assets")
        .select("*")
        .eq("verification_run_id", runId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!runId,
  });
}

export function useAddEvidenceAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: {
      verification_run_id: string;
      asset_type: string;
      asset_ref: string;
      label?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("verification_evidence_assets")
        .insert({ ...asset, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["verification-evidence-assets", vars.verification_run_id] });
    },
  });
}
