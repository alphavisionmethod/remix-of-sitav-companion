// ═══════════════════════════════════════════════════════════════
// SITA OS — Flagship Loop Proof Hook
// Records durable receipts when a user actually completes a step in
// one of the 5 flagship customer journeys, and exposes recent proofs.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FlagshipLoopKey =
  | "sign-in-dashboard-pulse"
  | "files-ai-assist"
  | "boardroom-summary-decision"
  | "connected-services-sync"
  | "admin-truth-recommendation-approval";

export type LoopStepKey =
  | "sign_in"
  | "pulse_view"
  | "file_upload"
  | "ai_classify"
  | "boardroom_summary"
  | "sync_run"
  | "approval_decision";

interface EmitParams {
  loop_key: FlagshipLoopKey;
  step_key: LoopStepKey;
  outcome?: "success" | "failure" | "partial";
  evidence?: Record<string, unknown>;
  latency_ms?: number;
}

/**
 * Fire-and-forget emit. Resolves silently if the user is not signed in
 * (demo mode) so we never break the host UI.
 */
export async function emitLoopCompletion(p: EmitParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("flagship_loop_completions").insert({
      user_id: user.id,
      loop_key: p.loop_key,
      step_key: p.step_key,
      outcome: p.outcome ?? "success",
      evidence: p.evidence ?? {},
      latency_ms: p.latency_ms ?? null,
    });
  } catch {
    // Receipts must never break the host flow.
  }
}

export function useEmitLoopCompletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: emitLoopCompletion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flagship-loop-completions"] });
    },
  });
}

/**
 * Recent completions for a given loop (or all). Used by FL boards and Pulse.
 */
export function useFlagshipLoopProofs(loop_key?: FlagshipLoopKey, limit = 25) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["flagship-loop-completions", loop_key ?? "all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("flagship_loop_completions")
        .select("*")
        .eq("user_id", user!.id)
        .order("emitted_at", { ascending: false })
        .limit(limit);
      if (loop_key) q = q.eq("loop_key", loop_key);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

/**
 * Aggregated proof status across all 5 loops — number of completions in the
 * last 24h per loop, used by the Launch Honesty gate.
 */
export function useFlagshipLoopHealth() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["flagship-loop-health", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("flagship_loop_completions")
        .select("loop_key, outcome")
        .eq("user_id", user!.id)
        .gte("emitted_at", since);
      if (error) throw error;
      const buckets: Record<string, { success: number; failure: number; partial: number }> = {};
      for (const row of data ?? []) {
        const k = (row as { loop_key: string }).loop_key;
        const o = (row as { outcome: string }).outcome as keyof typeof buckets[string];
        if (!buckets[k]) buckets[k] = { success: 0, failure: 0, partial: 0 };
        buckets[k][o] = (buckets[k][o] ?? 0) + 1;
      }
      return buckets;
    },
    staleTime: 60_000,
  });
}

/**
 * Convenience wrapper that emits and exposes a stable callback.
 */
export function useLoopEmitter(loop_key: FlagshipLoopKey) {
  const emit = useEmitLoopCompletion();
  return useCallback(
    (step_key: LoopStepKey, opts?: Omit<EmitParams, "loop_key" | "step_key">) =>
      emit.mutate({ loop_key, step_key, ...opts }),
    [emit, loop_key],
  );
}

/**
 * Selector helpers exposed for tests and admin boards.
 */
export const FLAGSHIP_LOOP_KEYS: FlagshipLoopKey[] = [
  "sign-in-dashboard-pulse",
  "files-ai-assist",
  "boardroom-summary-decision",
  "connected-services-sync",
  "admin-truth-recommendation-approval",
];

export function useLoopProofsSummary() {
  const { data } = useFlagshipLoopHealth();
  return useMemo(() => {
    return FLAGSHIP_LOOP_KEYS.map((k) => {
      const b = data?.[k] ?? { success: 0, failure: 0, partial: 0 };
      const total = b.success + b.failure + b.partial;
      return {
        loop_key: k,
        completions_24h: total,
        success_rate: total > 0 ? Math.round((b.success / total) * 100) : 0,
        proven: total > 0 && b.success > 0,
      };
    });
  }, [data]);
}
