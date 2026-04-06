// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Journey Hooks
// React Query hooks for journey CRUD + seeding
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CUSTOMER_JOURNEY_REGISTRY } from "./journey-registry";

// ── Queries ──

export function useCustomerJourneys() {
  return useQuery({
    queryKey: ["customer-journeys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_journeys")
        .select("*")
        .order("domain", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCustomerJourneyRuns(journeyKey?: string) {
  return useQuery({
    queryKey: ["customer-journey-runs", journeyKey],
    queryFn: async () => {
      let q = supabase
        .from("customer_journey_runs")
        .select("*")
        .order("created_at", { ascending: false });
      if (journeyKey) q = q.eq("journey_key", journeyKey);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCustomerJourneySteps(runId?: string) {
  return useQuery({
    queryKey: ["customer-journey-steps", runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from("customer_journey_steps")
        .select("*")
        .eq("run_id", runId)
        .order("step_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!runId,
  });
}

export function useCustomerJourneyBlockers() {
  return useQuery({
    queryKey: ["customer-journey-blockers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_journey_blockers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ── Seed Journeys from Registry ──

export function useSeedJourneys() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const rows = CUSTOMER_JOURNEY_REGISTRY.map((j) => ({
        user_id: user.id,
        journey_key: j.journeyKey,
        display_name: j.displayName,
        persona: j.persona as string,
        domain: j.domain,
        route_family: j.routeFamily,
        primary_modes: j.primaryModes,
        steps: JSON.parse(JSON.stringify(j.steps)),
        expected_outcome: j.expectedOutcome,
        launch_importance: j.launchImportance as string,
        dependencies: j.dependencies,
        owner: j.owner,
        current_status: "unverified",
      }));

      const { error } = await supabase
        .from("customer_journeys")
        .upsert(rows, { onConflict: "user_id,journey_key" });
      if (error) throw error;
      return rows.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer-journeys"] }),
  });
}

// ── Record a Journey Run ──

export function useRecordJourneyRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (run: {
      journey_key: string;
      mode: string;
      status: string;
      launch_impact: string;
      proof_confidence: string;
      steps_passed: number;
      steps_failed: number;
      steps_total: number;
      expected_outcome?: string;
      actual_outcome?: string;
      degraded_reason?: string;
      demo_governed?: boolean;
      recommended_fix?: string;
      root_cause_layer?: string;
      severity?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("customer_journey_runs")
        .insert({ ...run, user_id: user.id, completed_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;

      // Update journey status
      await supabase
        .from("customer_journeys")
        .update({
          current_status: run.status,
          last_verified_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("journey_key", run.journey_key);

      // Auto-create blocker if launch_blocker + broken
      if (
        (run.launch_impact === "launch_blocker" || run.launch_impact === "pilot_blocker") &&
        (run.status === "broken" || run.status === "partial")
      ) {
        await supabase.from("customer_journey_blockers").insert({
          user_id: user.id,
          journey_key: run.journey_key,
          run_id: data.id,
          blocker_type: run.launch_impact,
          severity: run.severity || "high",
          summary: `Journey "${run.journey_key}" is ${run.status}: ${run.actual_outcome || "see run details"}`,
          recommended_fix: run.recommended_fix,
        });
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-journey-runs"] });
      qc.invalidateQueries({ queryKey: ["customer-journeys"] });
      qc.invalidateQueries({ queryKey: ["customer-journey-blockers"] });
    },
  });
}

// ── Stats helpers ──

export function useJourneyStats() {
  const { data: journeys } = useCustomerJourneys();
  const { data: runs } = useCustomerJourneyRuns();
  const { data: blockers } = useCustomerJourneyBlockers();

  const total = journeys?.length ?? 0;
  const statuses = (journeys ?? []).reduce<Record<string, number>>((acc, j) => {
    const s = (j as any).current_status || "unverified";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const domains = [...new Set((journeys ?? []).map((j: any) => j.domain))];
  const domainScores = domains.map((d) => {
    const dj = (journeys ?? []).filter((j: any) => j.domain === d);
    const working = dj.filter((j: any) => j.current_status === "working").length;
    return { domain: d, total: dj.length, working, score: dj.length > 0 ? Math.round((working / dj.length) * 100) : 0 };
  });

  return {
    total,
    statuses,
    domainScores,
    totalRuns: runs?.length ?? 0,
    unresolvedBlockers: (blockers ?? []).filter((b: any) => !b.resolved).length,
  };
}
