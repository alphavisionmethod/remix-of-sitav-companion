// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Scheduling Data Service
// Reads/writes the canonical `bookings` table for Business OS.
// Reuses Booking / NoShowRisk contracts. RLS enforced server-side.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import {
  bookingRowToVM,
  type BookingRow,
  type ScheduledAppointmentVM,
} from "@/modules/business/domain/scheduling/types";
import { buildDemoScheduledAppointments } from "@/data/fixtures/mock-data/business-scheduling";

export type SchedulingMode = "demo" | "live";

export interface FetchScheduledAppointmentsOptions {
  mode: SchedulingMode;
  /** ISO start of the window (defaults to now - 7 days). */
  from?: string;
  /** ISO end of the window (defaults to now + 30 days). */
  to?: string;
}

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function defaultWindow(): { from: string; to: string } {
  const now = Date.now();
  return {
    from: new Date(now - 7 * 86400000).toISOString(),
    to: new Date(now + 30 * 86400000).toISOString(),
  };
}

/**
 * Fetch scheduled appointments for the active operator.
 * Demo mode → fixture. Live mode → `bookings` table scoped by RLS.
 */
export async function fetchScheduledAppointments(
  opts: FetchScheduledAppointmentsOptions
): Promise<ScheduledAppointmentVM[]> {
  if (opts.mode === "demo") {
    return buildDemoScheduledAppointments();
  }

  const userId = await uid();
  if (!userId) return [];

  const { from, to } = {
    ...defaultWindow(),
    ...(opts.from ? { from: opts.from } : {}),
    ...(opts.to ? { to: opts.to } : {}),
  };

  const { data, error } = await fromTable("bookings")
    .select("*")
    .eq("user_id", userId)
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    if (error) console.error("[business-scheduling] fetch:", error);
    return [];
  }

  const now = new Date();
  return (data as BookingRow[]).map((row) => bookingRowToVM(row, now));
}

// ── Mutations ──────────────────────────────────────────────────

export interface MutationResult {
  ok: boolean;
  error?: string;
}

async function patchBookingMetadata(
  bookingId: string,
  patch: Record<string, unknown>,
  statusUpdate?: string
): Promise<MutationResult> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "not-authenticated" };

  // Read current metadata first to merge (avoid clobbering)
  const { data: existing, error: readErr } = await fromTable("bookings")
    .select("metadata")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .single();
  if (readErr) {
    console.error("[business-scheduling] read:", readErr);
    return { ok: false, error: readErr.message };
  }

  const merged = { ...(existing?.metadata ?? {}), ...patch };
  const updates: Record<string, unknown> = { metadata: merged };
  if (statusUpdate) updates.status = statusUpdate;

  const { error } = await fromTable("bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("user_id", userId);

  if (error) {
    console.error("[business-scheduling] update:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Mark a confirmation reminder as sent. */
export async function sendConfirmationReminder(
  bookingId: string,
  channel: "sms" | "email" | "phone" = "sms"
): Promise<MutationResult> {
  return patchBookingMetadata(bookingId, {
    lastReminderAt: new Date().toISOString(),
    lastReminderChannel: channel,
  });
}

/** Mark a booking as confirmed by the customer. */
export async function markBookingConfirmed(
  bookingId: string
): Promise<MutationResult> {
  return patchBookingMetadata(
    bookingId,
    { confirmedAt: new Date().toISOString() },
    "confirmed"
  );
}

export interface PreparedRecoveryMessage {
  bookingId: string;
  channel: "sms" | "email" | "phone";
  subject: string;
  body: string;
}

/** Record a no-show recovery attempt and return a prepared outreach message. */
export async function recoverNoShow(
  bookingId: string,
  channel: "sms" | "email" | "phone" = "email"
): Promise<MutationResult & { message?: PreparedRecoveryMessage }> {
  const result = await patchBookingMetadata(bookingId, {
    recoveryAttemptedAt: new Date().toISOString(),
    recoveryChannel: channel,
  });
  if (!result.ok) return result;

  return {
    ok: true,
    message: {
      bookingId,
      channel,
      subject: "We missed you — let's reschedule",
      body:
        "Hi — we noticed you couldn't make your recent appointment. " +
        "Would either of these times work to reschedule? " +
        "Reply with the slot that fits best and we'll lock it in.",
    },
  };
}