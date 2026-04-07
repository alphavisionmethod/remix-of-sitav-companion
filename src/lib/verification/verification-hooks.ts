// ═══════════════════════════════════════════════════════
// SITA OS — Verification Hooks for DB Operations
// ═══════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { SURFACE_REGISTRY, type SurfaceEntry } from "./surface-registry";

export function useVerificationSurfaces() {
  return useQuery({
    queryKey: ["verification-surfaces"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("verification_surfaces")
        .select("*")
        .eq("user_id", user.id)
        .order("test_priority", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
}

export function useVerificationRuns(surfaceId?: string) {
  return useQuery({
    queryKey: ["verification-runs", surfaceId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      let q = supabase
        .from("verification_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (surfaceId) q = q.eq("surface_id", surfaceId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    staleTime: 15_000,
  });
}

export function useVerificationBlockers() {
  return useQuery({
    queryKey: ["verification-blockers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("verification_blockers")
        .select("*")
        .eq("user_id", user.id)
        .eq("resolved", false)
        .order("severity", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 15_000,
  });
}

export function useVerificationEvidence(runId?: string) {
  return useQuery({
    queryKey: ["verification-evidence", runId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      let q = supabase
        .from("verification_evidence")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (runId) q = q.eq("run_id", runId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!runId,
    staleTime: 15_000,
  });
}

export function useSeedSurfaces() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check existing surfaces
      const { data: existing } = await supabase
        .from("verification_surfaces")
        .select("route_key")
        .eq("user_id", user.id);
      const existingKeys = new Set((existing || []).map((e: any) => e.route_key));

      // Insert missing surfaces
      const toInsert = SURFACE_REGISTRY
        .filter((s) => !existingKeys.has(s.routeKey))
        .map((s) => ({
          user_id: user.id,
          route_key: s.routeKey,
          route_path: s.routePath,
          shell: s.shell,
          surface_class: s.surfaceClass,
          domain: s.domain,
          component_name: s.componentName || null,
          action_type: s.actionType,
          action_label: s.actionLabel,
          action_selector: s.actionSelector || null,
          expected_result: s.expectedResult,
          backend_dependency: s.backendDependency || null,
          supported_modes: s.supportedModes,
          launch_honesty_class: s.launchHonestyClass,
          test_priority: s.testPriority,
          owner: s.owner || null,
          verification_status: "untested",
        }));

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("verification_surfaces")
          .insert(toInsert);
        if (error) throw error;
      }
      return { seeded: toInsert.length, skipped: existingKeys.size };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["verification-surfaces"] });
      toast.success(`Seeded ${result.seeded} surfaces (${result.skipped} already existed)`);
    },
    onError: (e) => toast.error("Seed failed: " + e.message),
  });
}

export function useRecordVerificationRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      surface_id: string;
      run_type: string;
      mode: string;
      passed: boolean;
      failure_reason?: string;
      duration_ms?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("verification_runs").insert({
        user_id: user.id,
        ...input,
      });
      if (error) throw error;
      // Update surface verification status
      await supabase
        .from("verification_surfaces")
        .update({ verification_status: input.passed ? "pass" : "fail" })
        .eq("id", input.surface_id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification-runs"] });
      qc.invalidateQueries({ queryKey: ["verification-surfaces"] });
    },
  });
}

export function useResolveBlocker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (blockerId: string) => {
      const { error } = await supabase
        .from("verification_blockers")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", blockerId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification-blockers"] });
      toast.success("Blocker resolved");
    },
  });
}
