// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10: Appointment ↔ Calendar Sync
//
// Internal sync (Phase A): mirror appointments into the unified
// `calendar_events` table on create/update so the user's calendar
// always reflects every booked appointment. Sync state tracked in
// `calendar_sync_links` for an honest, verifiable history.
//
// Google Calendar (Phase B): scaffolded via `provider: 'google'`
// path that records intent + returns a deferred status until the
// per-user OAuth flow is wired.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export type CalendarSyncProvider = "internal" | "google" | "outlook";
export type CalendarSyncStatus = "pending" | "synced" | "failed" | "conflict" | "deleted";

export interface AppointmentSyncResult {
  ok: boolean;
  provider: CalendarSyncProvider;
  status: CalendarSyncStatus;
  calendarEventId?: string | null;
  externalEventId?: string | null;
  error?: string;
  deferred?: boolean;
}

interface AppointmentLite {
  id: string;
  user_id: string;
  title: string;
  appointment_date: string;
  location?: string | null;
  notes?: string | null;
  category?: string | null;
}

function toEventRow(appt: AppointmentLite) {
  const d = new Date(appt.appointment_date);
  const end = new Date(d.getTime() + 60 * 60 * 1000);
  return {
    user_id: appt.user_id,
    title: appt.title,
    event_date: d.toISOString().slice(0, 10),
    start_time: d.toISOString(),
    end_time: end.toISOString(),
    domain: "business",
    event_type: "appointment",
    location: appt.location ?? null,
    notes: appt.notes ?? null,
    source: "appointment-sync",
    source_id: appt.id,
    color: "#7c3aed",
    priority: "normal",
  };
}

/** Push an appointment to the internal calendar. Idempotent on `(source, source_id)`. */
export async function syncAppointmentToInternalCalendar(
  appt: AppointmentLite,
): Promise<AppointmentSyncResult> {
  // Check for an existing link
  const { data: existing } = await fromTable("calendar_sync_links")
    .select("id, calendar_event_id")
    .eq("appointment_id", appt.id)
    .eq("provider", "internal")
    .maybeSingle();

  const row = toEventRow(appt);

  let eventId: string | null = existing?.calendar_event_id ?? null;
  if (eventId) {
    const { error: updErr } = await fromTable("calendar_events")
      .update(row)
      .eq("id", eventId)
      .eq("user_id", appt.user_id);
    if (updErr) {
      await recordLink(appt, "internal", null, "failed", updErr.message);
      return { ok: false, provider: "internal", status: "failed", error: updErr.message };
    }
  } else {
    const { data: ins, error: insErr } = await fromTable("calendar_events")
      .insert(row)
      .select("id")
      .single();
    if (insErr || !ins) {
      await recordLink(appt, "internal", null, "failed", insErr?.message ?? "insert-failed");
      return { ok: false, provider: "internal", status: "failed", error: insErr?.message };
    }
    eventId = ins.id;
  }

  await recordLink(appt, "internal", eventId, "synced", null);
  await stampAppointmentMeta(appt.id, appt.user_id, {
    calendar_synced: true,
    calendar_event_id: eventId,
    calendar_synced_at: new Date().toISOString(),
    calendar_provider: "internal",
  });

  return { ok: true, provider: "internal", status: "synced", calendarEventId: eventId };
}

/**
 * Google Calendar sync — Phase B placeholder.
 * Records intent in calendar_sync_links with status 'pending' and
 * stamps the appointment so the UI can honestly say "Google sync queued
 * — connect Google Calendar to dispatch".
 */
export async function syncAppointmentToGoogleCalendar(
  appt: AppointmentLite,
): Promise<AppointmentSyncResult> {
  await recordLink(appt, "google", null, "pending", "google-oauth-not-yet-wired");
  await stampAppointmentMeta(appt.id, appt.user_id, {
    google_sync_pending: true,
    google_sync_queued_at: new Date().toISOString(),
  });
  return {
    ok: true,
    provider: "google",
    status: "pending",
    deferred: true,
    error: "Google Calendar OAuth not yet connected for this user.",
  };
}

/** Remove an appointment from all linked calendars. */
export async function unsyncAppointment(appointmentId: string): Promise<void> {
  const { data: links } = await fromTable("calendar_sync_links")
    .select("id, provider, calendar_event_id")
    .eq("appointment_id", appointmentId);
  for (const link of links ?? []) {
    if (link.provider === "internal" && link.calendar_event_id) {
      await fromTable("calendar_events").delete().eq("id", link.calendar_event_id);
    }
    await fromTable("calendar_sync_links")
      .update({ sync_status: "deleted", last_synced_at: new Date().toISOString() })
      .eq("id", link.id);
  }
}

async function recordLink(
  appt: AppointmentLite,
  provider: CalendarSyncProvider,
  calendarEventId: string | null,
  status: CalendarSyncStatus,
  errorMessage: string | null,
): Promise<void> {
  // Upsert by (appointment_id, provider) — table has UNIQUE constraint
  await fromTable("calendar_sync_links").upsert(
    {
      user_id: appt.user_id,
      appointment_id: appt.id,
      provider,
      calendar_event_id: calendarEventId,
      sync_status: status,
      last_synced_at: status === "synced" ? new Date().toISOString() : null,
      last_error: errorMessage,
    },
    { onConflict: "appointment_id,provider" },
  );
}

async function stampAppointmentMeta(
  appointmentId: string,
  userId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { data: prev } = await fromTable("appointments")
    .select("metadata")
    .eq("id", appointmentId)
    .eq("user_id", userId)
    .maybeSingle();
  const merged = { ...((prev?.metadata as Record<string, unknown> | null) ?? {}), ...patch };
  await fromTable("appointments").update({ metadata: merged }).eq("id", appointmentId).eq("user_id", userId);
}

/** Read the latest sync state for one or more appointments. */
export async function getAppointmentSyncStatus(appointmentIds: string[]): Promise<Map<string, { provider: CalendarSyncProvider; status: CalendarSyncStatus; lastSyncedAt: string | null; lastError: string | null }[]>> {
  const result = new Map<string, { provider: CalendarSyncProvider; status: CalendarSyncStatus; lastSyncedAt: string | null; lastError: string | null }[]>();
  if (!appointmentIds.length) return result;
  const { data } = await fromTable("calendar_sync_links")
    .select("appointment_id, provider, sync_status, last_synced_at, last_error")
    .in("appointment_id", appointmentIds);
  for (const row of data ?? []) {
    const id = row.appointment_id as string;
    const list = result.get(id) ?? [];
    list.push({
      provider: row.provider as CalendarSyncProvider,
      status: row.sync_status as CalendarSyncStatus,
      lastSyncedAt: row.last_synced_at as string | null,
      lastError: row.last_error as string | null,
    });
    result.set(id, list);
  }
  return result;
}

/** React-Query hook wrapper. */
export async function syncAppointmentEverywhere(appointmentId: string): Promise<AppointmentSyncResult[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: appt } = await fromTable("appointments")
    .select("id, user_id, title, appointment_date, location, notes, category")
    .eq("id", appointmentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!appt) return [];
  const internal = await syncAppointmentToInternalCalendar(appt as AppointmentLite);
  return [internal];
}
