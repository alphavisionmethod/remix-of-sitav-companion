// ═══════════════════════════════════════════════════════════════
// SITA OS — useScheduledAppointments hook family
// React Query wrappers + realtime invalidation + governed mutations
// for the canonical Appointments Scheduling surface. Mirrors the
// useBackgroundJobs pattern — no parallel infra.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncAppointmentEverywhere } from "@/lib/business/appointment-calendar-sync";
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
import { emitClientReceipt, emitClientFailureReceipt } from "@/lib/trust/emit-client-receipt";
import { withApprovalGate, type ApprovalGateResult } from "@/lib/trust/request-approval";

const SCHEDULE_KEY = "business-scheduling" as const;

export interface UseScheduledAppointmentsOptions {
  /** ISO start of the window (default: now − 7 days). */
  from?: string;
  /** ISO end of the window (default: now + 30 days). */
  to?: string;
  /** Phase 6: scope by linked CRM contact. */
  crmContactId?: string;
  /** Phase 6: scope by linked CRM company. */
  crmCompanyId?: string;
  /** Phase 6: scope by linked opportunity. */
  opportunityId?: string;
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
  const { from, to, crmContactId, crmCompanyId, opportunityId } = options;
  const { mode } = useDataMode();
  const { userId, loaded } = useCurrentUserId();

  const isUnauthenticated = mode === "live" && loaded && !userId;

  const result = usePageData<ScheduledAppointmentVM[]>({
    queryKey: [
      SCHEDULE_KEY,
      mode,
      userId ?? "anon",
      from ?? "default",
      to ?? "default",
      crmContactId ?? "",
      crmCompanyId ?? "",
      opportunityId ?? "",
    ],
    queryFn: () => fetchScheduledAppointments({
      mode, from, to, crmContactId, crmCompanyId, opportunityId,
    }),
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
  // Reminders are external outreach but low-blast (single recipient, the
  // operator already booked them) → emit a canonical receipt around every
  // attempt, but do NOT gate. Failures emit a structured failure receipt.
  return useReceiptedScheduleMutation<
    { bookingId: string; channel?: "sms" | "email" | "phone" },
    MutationResult
  >(
    async ({ bookingId, channel = "sms" }) => {
      try {
        const out = await sendConfirmationReminder(bookingId, channel);
        if (out.ok) {
          await emitClientReceipt({
            actionType: "appointment.reminder.send",
            summary: `Sent ${channel} reminder for booking ${bookingId}`,
            payload: {
              args: { bookingId, channel },
              entity_ref: { entity_type: "booking", entity_id: bookingId },
            },
            riskTier: "medium",
            status: "executed",
            metadata: { channel },
          });
        } else {
          await emitClientFailureReceipt({
            actionType: "appointment.reminder.send",
            summary: `Reminder failed for booking ${bookingId}`,
            payload: { args: { bookingId, channel } },
            riskTier: "medium",
            errorCode: "reminder_send_failed",
            errorMessage: out.error ?? "unknown",
          });
        }
        return out;
      } catch (err) {
        await emitClientFailureReceipt({
          actionType: "appointment.reminder.send",
          summary: `Reminder threw for booking ${bookingId}`,
          payload: { args: { bookingId, channel } },
          riskTier: "medium",
          errorCode: "reminder_send_threw",
          errorMessage: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
    () => "Reminder sent",
  );
}

export function useMarkBookingConfirmed() {
  return useReceiptedScheduleMutation<{ bookingId: string }, MutationResult>(
    async ({ bookingId }) => {
      const res = await markBookingConfirmed(bookingId);
      // Phase 10: once a booking is confirmed, mirror it to the unified
      // internal calendar (and queue Google sync if scaffolded).
      // Failures are non-fatal — they're recorded in calendar_sync_links.
      if (res.ok) {
        try { await syncAppointmentEverywhere(bookingId); } catch { /* best-effort */ }
        await emitClientReceipt({
          actionType: "appointment.confirm",
          summary: `Booking ${bookingId} confirmed`,
          payload: {
            args: { bookingId },
            entity_ref: { entity_type: "booking", entity_id: bookingId },
          },
          riskTier: "low",
          status: "executed",
        });
      }
      return res;
    },
    () => "Booking confirmed",
  );
}

/**
 * No-show recovery touches a customer who already failed to show up — high
 * brand-risk external outreach. Routes through `withApprovalGate` (queued
 * at `high`/`critical`) so an operator can review the prepared message.
 * The hook returns either an executed `MutationResult` (when skipped/demo)
 * or a `gated` envelope the caller must surface to the user.
 */
export type RecoverNoShowResult =
  | (MutationResult & { gated: false; message?: PreparedRecoveryMessage })
  | { gated: true; approvalId: string; receiptId: string | null; ok: true };

export function useRecoverNoShow() {
  const queryClient = useQueryClient();
  return useMutation<
    RecoverNoShowResult,
    Error,
    { bookingId: string; channel?: "sms" | "email" | "phone"; reason?: string; skip?: boolean }
  >({
    mutationFn: async ({ bookingId, channel = "email", reason, skip }) => {
      const gated: ApprovalGateResult<MutationResult & { message?: PreparedRecoveryMessage }> =
        await withApprovalGate(
          async () => {
            const out = await recoverNoShow(bookingId, channel);
            if (out.ok) {
              await emitClientReceipt({
                actionType: "appointment.recovery.send",
                summary: `No-show recovery prepared for booking ${bookingId}`,
                payload: {
                  args: { bookingId, channel },
                  entity_ref: { entity_type: "booking", entity_id: bookingId },
                },
                riskTier: "high",
                status: "executed",
                metadata: { channel },
              });
            } else {
              await emitClientFailureReceipt({
                actionType: "appointment.recovery.send",
                summary: `No-show recovery failed for booking ${bookingId}`,
                payload: { args: { bookingId, channel } },
                riskTier: "high",
                errorCode: "recovery_failed",
                errorMessage: out.error ?? "unknown",
              });
            }
            return out;
          },
          {
            actionType: "appointment.recovery.send",
            title: `Send no-show recovery (${channel}) for booking ${bookingId}`,
            justification:
              reason ??
              "External outreach to a customer who missed their appointment. Reviewed before send to protect brand and avoid duplicate contact.",
            riskTier: "high",
            payload: { bookingId, channel },
            launchImplications: `Sends ${channel} message to one third party.`,
            skip,
          },
        );

      if (gated.gated) {
        return {
          gated: true,
          approvalId: gated.approvalId,
          receiptId: gated.receiptId,
          ok: true,
        };
      }
      return { ...gated.result, gated: false } as RecoverNoShowResult;
    },
    onSuccess: (out) => {
      if (out.gated) {
        toast.message("Recovery queued for approval");
      } else if (out.ok) {
        toast.success("Recovery message prepared");
        void queryClient.invalidateQueries({ queryKey: [SCHEDULE_KEY] });
      } else {
        toast.error(out.error ?? "Recovery failed");
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Recovery failed unexpectedly");
    },
  });
}

export type { ScheduledAppointmentVM, PreparedRecoveryMessage };
