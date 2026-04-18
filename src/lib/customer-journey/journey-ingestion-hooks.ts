// ═══════════════════════════════════════════════════════════════
// SITA OS — Journey Ingestion Hooks
// React Query hooks for recording verification runs,
// updating journey status, and ingesting Playwright results
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { seedJourneyRegistry } from "./journey-registry-seeder";
import { computeBlockerScore, type BlockerInput } from "./blocker-scoring-engine";

// ── Query: Normalized Journey Summary (from view) ──

export function useJourneySummaryView() {
  return useQuery({
    queryKey: ["v-customer-journey-summary"],
    queryFn: async () => {
      const { data, error } = await fromDynamicTable("v_customer_journey_summary")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ── Query: Blockers from view ──

export function useBlockersView() {
  return useQuery({
    queryKey: ["v-customer-journey-blockers"],
    queryFn: async () => {
      const { data, error } = await fromDynamicTable("v_customer_journey_blockers")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ── Query: Mode deltas from view ──

export function useModeDeltas() {
  return useQuery({
    queryKey: ["v-customer-journey-mode-deltas"],
    queryFn: async () => {
      const { data, error } = await fromDynamicTable("v_customer_journey_mode_deltas")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ── Query: Route coverage from view ──

export function useRouteCoverageSummary() {
  return useQuery({
    queryKey: ["v-route-verification-summary"],
    queryFn: async () => {
      const { data, error } = await fromDynamicTable("v_route_verification_summary")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ── Query: Recent failures from view ──

export function useRecentFailures() {
  return useQuery({
    queryKey: ["v-customer-journey-recent-failures"],
    queryFn: async () => {
      const { data, error } = await fromDynamicTable("v_customer_journey_recent_failures")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ── Mutation: Seed Normalized Registry ──

export function useSeedJourneyRegistry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedJourneyRegistry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["v-customer-journey-summary"] });
    },
  });
}

// ── Mutation: Record a Verification Run ──

export interface VerificationRunInput {
  journey_key: string;
  mode: string;
  environment: string;
  verification_type: string;
  status: string;
  proof_confidence: string;
  steps_passed: number;
  steps_failed: number;
  steps_skipped: number;
  launch_impact?: string;
  summary?: string;
  evidence_bundle_ref?: string;
  run_identifier?: string;
  commit_sha?: string;
  branch_name?: string;
  started_at?: string;
  completed_at?: string;
}

export function useRecordVerificationRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: VerificationRunInput) => {
      // Look up journey_id from registry
      const { data: registry } = await fromTable("customer_journey_registry")
        .select("id")
        .eq("journey_key", input.journey_key)
        .single();

      if (!registry) throw new Error(`Journey not found in registry: ${input.journey_key}`);

      const { data, error } = await fromTable("journey_verification_runs")
        .insert({
          journey_id: registry.id,
          mode: input.mode,
          environment: input.environment,
          verification_type: input.verification_type,
          status: input.status,
          proof_confidence: input.proof_confidence,
          steps_passed: input.steps_passed,
          steps_failed: input.steps_failed,
          steps_skipped: input.steps_skipped,
          launch_impact: input.launch_impact,
          summary: input.summary,
          evidence_bundle_ref: input.evidence_bundle_ref,
          run_identifier: input.run_identifier,
          commit_sha: input.commit_sha,
          branch_name: input.branch_name,
          started_at: input.started_at,
          completed_at: input.completed_at || new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      // Update customer_journey_status
      await fromTable("customer_journey_status")
        .upsert(
          {
            journey_id: registry.id,
            current_status: input.status,
            last_verified_run_id: data.id,
            last_verified_at: new Date().toISOString(),
            launch_impact: input.launch_impact,
            proof_confidence: input.proof_confidence,
            actual_outcome_summary: input.summary,
          },
          { onConflict: "journey_id" }
        );

      // Auto-score blockers for failed runs
      if (input.status === "fail" || input.status === "partial" || input.status === "broken") {
        const blockerInput: BlockerInput = {
          journey_key: input.journey_key,
          launch_importance: input.launch_impact || "important_non_blocker",
          status: input.status === "fail" ? "broken" : input.status,
          mode: input.mode,
          persona: "user",
          domain: input.journey_key.split(".")[0],
          steps_failed: input.steps_failed,
          steps_total: input.steps_passed + input.steps_failed + input.steps_skipped,
          verification_run_id: data.id,
        };

        const result = computeBlockerScore(blockerInput);

        await fromTable("launch_blocker_scores")
          .insert({
            journey_id: registry.id,
            journey_key: input.journey_key,
            verification_run_id: data.id,
            ...result,
            resolved: false,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["v-customer-journey-summary"] });
      qc.invalidateQueries({ queryKey: ["v-customer-journey-blockers"] });
      qc.invalidateQueries({ queryKey: ["v-customer-journey-recent-failures"] });
    },
  });
}
