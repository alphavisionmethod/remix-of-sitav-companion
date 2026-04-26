// ═══════════════════════════════════════════════════════════════
// SITA OS — useScheduledAppointments hook family
// React Query wrappers + realtime invalidation + governed mutations
// for the canonical Appointments Scheduling surface. Mirrors the
// useBackgroundJobs pattern — no parallel infra.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePageData, type PageDataResult } from "@/hooks/usePageData";
import {
  fetchScheduledAppointments,
  sendConfirmationReminder,
  markBookingConfirmed,
  recoverNoShow,
  type MutationResult,
  type PreparedRecoveryMessage,
} from "@/data/repositories/business-scheduling-service";
import type { ScheduledAppointmentVM } from "@/modules/business/domain/scheduling/types";

const SCHEDULE_KEY = "business-scheduling" as const;

export interface UseScheduledAppointmentsOptions {
  /** ISO start of the window (default: now − 7 days). */
  from?: string;
  /** ISO end of the window (default: now + 30 days). */
  to?: string;
}

export interface UseScheduledAppointmentsResult {
  appointments: ScheduledAppointmentVM[];
  state: PageDataResult<ScheduledAppointmentVM[]>["state"];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isReady: boolean;
  error: Error | null;
  refetch: () => void;
  isUnauthenticated: boolean;
  userId: string | null;
  /** True iff live mode + authenticated; useful for conditional UI. */
  isLive: boolean;
}

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
 * Canonical page hook for AppointmentsScheduling.
 * Demo mode → fixture. Live mode → bookings table (RLS-scoped).
 */
export function useScheduledAppointments(
  options: UseScheduledAppointmentsOptions = {}
): UseScheduledAppointmentsResult {
  const { from, to } = options;
  const { mode } = useDataMode();
  const { userId, loaded } = useCurrentUserId();

  const isUnauthenticated = mode === "live" && loaded && !userId;

  const result = usePageData<ScheduledAppointmentVM[]>({
    queryKey: [SCHEDULE_KEY, mode, userId ?? "anon", from ?? "default", to ?? "default"],
    queryFn: () => fetchScheduledAppointments({ mode, from, to }),
    enabled: mode === "demo" || (loaded && !!userId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    emptyCheck: (d) => !d || d.length === 0,
  });

  const appointments = result.data ?? [];

  return {
    appointments,
    state: result.state,
    isLoading: result.isLoading,
    isError: result.isError,
    isEmpty: result.isEmpty,
    isReady: result.isReady,
    error: result.error,
    refetch: result.refetch,
    isUnauthenticated,
    userId,
    isLive: mode === "live" && !!userId,
  };
}

/**
 * Realtime invalidation for the bookings table.
 * Live mode only. One channel per user. No-op in demo mode.
 */
export function useScheduledAppointmentsRealtime(): void {
  const { mode } = useDataMode();
  const { userId } = useCurrentUserId();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (mode !== "live" || !userId) return;
    const channel = supabase
      .channel(`business-scheduling:${userId}`)
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${userId}` } as never,
        (() => {
          void queryClient.invalidateQueries({ queryKey: [SCHEDULE_KEY] });
        }) as never,
      );
    void channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [mode, userId, queryClient]);
}

// ── Mutations ───────────────────────────────────────────────────

function useReceiptedScheduleMutation<TInput, TOut extends MutationResult>(
  fn: (input: TInput) => Promise<TOut>,
  successMessage: (input: TInput, out: TOut) => string,
) {
  const queryClient = useQueryClient();
  return useMutation<TOut, Error, TInput>({
    mutationFn: (input) => fn(input),
    onSuccess: (out, input) => {
      if (out.ok) {
        toast.success(successMessage(input, out));
        void queryClient.invalidateQueries({ queryKey: [SCHEDULE_KEY] });
      } else {
        toast.error(out.error ?? "Action failed.");
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Action failed unexpectedly.");
    },
  });
}

export function useSendConfirmationReminder() {
  return useReceiptedScheduleMutation<
    { bookingId: string; channel?: "sms" | "email" | "phone" },
    MutationResult
  >(
    ({ bookingId, channel = "sms" }) => sendConfirmationReminder(bookingId, channel),
    () => "Reminder sent",
  );
}

export function useMarkBookingConfirmed() {
  return useReceiptedScheduleMutation<{ bookingId: string }, MutationResult>(
    ({ bookingId }) => markBookingConfirmed(bookingId),
    () => "Booking confirmed",
  );
}

export function useRecoverNoShow() {
  return useReceiptedScheduleMutation<
    { bookingId: string; channel?: "sms" | "email" | "phone" },
    MutationResult & { message?: PreparedRecoveryMessage }
  >(
    ({ bookingId, channel = "email" }) => recoverNoShow(bookingId, channel),
    () => "Recovery message prepared",
  );
}

export type { ScheduledAppointmentVM, PreparedRecoveryMessage };
