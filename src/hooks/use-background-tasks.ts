// ═══════════════════════════════════════════════════════════════
// SITA OS — useBackgroundTasks hook family
// React Query wrappers + realtime invalidation + governed mutations
// for the canonical Background Task Center.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePageData, type PageDataResult } from "@/hooks/usePageData";
import {
  fetchBackgroundJobs,
  retryBackgroundJob,
  cancelBackgroundJob,
  recordBackgroundJobAction,
  type BackgroundJobsResult,
  type JobActionResult,
} from "@/data/repositories/business-background-tasks-service";
import {
  summarizeJobs,
  groupJobsBySection,
  type BackgroundJobVM,
  type BackgroundJobsSummary,
  type BackgroundJobSections,
} from "@/modules/business/domain/background-tasks/types";

const BG_TASKS_KEY = "bg-tasks" as const;

export interface UseBackgroundJobsOptions {
  /** History window in hours (default 72). */
  sinceHours?: number;
}

export interface UseBackgroundJobsResult {
  jobs: BackgroundJobVM[];
  partial: boolean;
  failedSources: string[];
  summary: BackgroundJobsSummary;
  sections: BackgroundJobSections;
  state: PageDataResult<BackgroundJobsResult>["state"];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isReady: boolean;
  error: Error | null;
  refetch: () => void;
  /** True when live mode is active but no authenticated user is present. */
  isUnauthenticated: boolean;
  userId: string | null;
}

/**
 * Subscribe (once) to the current user's id. Used to gate live-mode
 * fetches and to scope the realtime channel.
 */
function useCurrentUserId(): { userId: string | null; loaded: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUserId(data.user?.id ?? null);
      setLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
  return { userId, loaded };
}

/**
 * Canonical page hook — wraps usePageData and exposes the
 * pre-aggregated summary/sections so the page never re-derives them.
 */
export function useBackgroundJobs(
  options: UseBackgroundJobsOptions = {}
): UseBackgroundJobsResult {
  const { sinceHours = 72 } = options;
  const { mode } = useDataMode();
  const { userId, loaded } = useCurrentUserId();

  const isUnauthenticated = mode === "live" && loaded && !userId;

  const result = usePageData<BackgroundJobsResult>({
    queryKey: [BG_TASKS_KEY, mode, userId ?? "anon", sinceHours],
    queryFn: () => fetchBackgroundJobs({ mode, sinceHours }),
    enabled: mode === "demo" || (loaded && !!userId),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    emptyCheck: (d) => !d || d.jobs.length === 0,
  });

  const jobs = result.data?.jobs ?? [];
  const summary = useMemo(() => summarizeJobs(jobs), [jobs]);
  const sections = useMemo(() => groupJobsBySection(jobs), [jobs]);

  return {
    jobs,
    partial: result.data?.partial ?? false,
    failedSources: result.data?.failedSources ?? [],
    summary,
    sections,
    state: result.state,
    isLoading: result.isLoading,
    isError: result.isError,
    isEmpty: result.isEmpty,
    isReady: result.isReady,
    error: result.error,
    refetch: result.refetch,
    isUnauthenticated,
    userId,
  };
}

/**
 * Realtime invalidation for the 6 source tables.
 * Live mode only. One channel per user. No-op in demo mode.
 */
export function useBackgroundJobsRealtime(): void {
  const { mode } = useDataMode();
  const { userId } = useCurrentUserId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode !== "live" || !userId) return;
    const filter = `user_id=eq.${userId}`;
    const tables = [
      "crm_import_jobs",
      "connector_sync_runs",
      "data_export_requests",
      "ingestion_jobs",
      "crm_automations",
      "workflow_runs",
    ] as const;

    let channel = supabase.channel(`bg-tasks:${userId}`);
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: [BG_TASKS_KEY] });
    };
    for (const table of tables) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      channel = channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table, filter } as never,
        invalidate as never,
      );
    }
    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [mode, userId, queryClient]);
}

// ── Mutations ────────────────────────────────────────────────

function useReceiptedJobMutation(
  action: "retry" | "cancel",
  fn: (job: BackgroundJobVM) => Promise<JobActionResult>,
) {
  const queryClient = useQueryClient();
  return useMutation<JobActionResult, Error, BackgroundJobVM>({
    mutationFn: async (job: BackgroundJobVM) => {
      const result = await fn(job);
      // Always emit a governance receipt (success or failure).
      void recordBackgroundJobAction(action, job, result);
      return result;
    },
    onSuccess: (result, job) => {
      if (result.ok) {
        toast.success(result.message ?? `${action === "retry" ? "Re-queued" : "Cancelled"}: ${job.title}`);
        void queryClient.invalidateQueries({ queryKey: [BG_TASKS_KEY] });
      } else {
        const reason = result.message ?? (
          result.reason === "not-supported"
            ? `${action === "retry" ? "Retry" : "Cancel"} is not supported for this job kind.`
            : result.reason === "not-authenticated"
              ? "Sign in required."
              : "Action failed."
        );
        toast.error(reason);
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Action failed unexpectedly.");
    },
  });
}

export function useRetryBackgroundJob() {
  return useReceiptedJobMutation("retry", retryBackgroundJob);
}

export function useCancelBackgroundJob() {
  return useReceiptedJobMutation("cancel", cancelBackgroundJob);
}

/** Convenience: emit a "view" receipt when the user opens the detail drawer. */
export function useRecordJobView() {
  return useCallback((job: BackgroundJobVM) => {
    void recordBackgroundJobAction("view", job, { ok: true });
  }, []);
}