// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Journey Scoring Hooks
// Blocker scores + mode comparisons
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

// ── Blocker Scores ──

export function useBlockerScores(resolved?: boolean) {
  return useQuery({
    queryKey: ["launch-blocker-scores", resolved],
    queryFn: async () => {
      let q = fromTable("launch_blocker_scores")
        .select("*")
        .order("severity_score", { ascending: false });
      if (resolved !== undefined) q = q.eq("resolved", resolved);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useResolveBlockerScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("launch_blocker_scores")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["launch-blocker-scores"] }),
  });
}

// ── Mode Comparisons ──

export function useModeComparisons() {
  return useQuery({
    queryKey: ["customer-journey-mode-comparisons"],
    queryFn: async () => {
      const { data, error } = await fromTable("customer_journey_mode_comparisons")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertModeComparison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (comp: {
      journey_key: string;
      real_status?: string;
      demo_status?: string;
      internal_test_status?: string;
      comparison_summary?: string;
      claim_risk?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await fromTable("customer_journey_mode_comparisons")
        .upsert(
          { ...comp, user_id: user.id, updated_at: new Date().toISOString() },
          { onConflict: "user_id,journey_key" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-journey-mode-comparisons"] }),
  });
}
