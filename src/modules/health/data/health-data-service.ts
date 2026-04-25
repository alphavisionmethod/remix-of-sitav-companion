// ════════════════════════════════════════════════════════════════
// Health OS — Real Data Service (Phase 3)
// All reads/writes go through Supabase with owner-only RLS.
// Demo mode returns empty arrays — never fake health data.
// ════════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

export type WearableProvider =
  | "apple_health" | "google_fit" | "fitbit" | "oura"
  | "garmin" | "whoop" | "withings" | "custom";

export interface HealthProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  date_of_birth: string | null;
  sex_at_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  blood_type: string | null;
  encrypted_payload: Record<string, unknown>;
  encryption_key_version: string;
  consent_share_with_advisors: boolean;
  consent_share_with_routing: boolean;
  emergency_contact: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HealthMetricLog {
  id: string;
  user_id: string;
  metric_kind: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  source: string;
  source_ref: string | null;
  sensitivity: string;
  recorded_at: string;
  notes: string | null;
  metadata: Record<string, unknown>;
}

export interface WearableConnection {
  id: string;
  user_id: string;
  provider: WearableProvider;
  account_label: string | null;
  scopes: string[];
  status: "pending" | "connected" | "revoked" | "error";
  last_sync_at: string | null;
  sync_cursor: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WearableSyncEvent {
  id: string;
  user_id: string;
  connection_id: string;
  started_at: string;
  completed_at: string | null;
  status: "in_progress" | "success" | "error";
  signal_count: number;
  error_message: string | null;
}

export interface HealthReminder {
  id: string;
  user_id: string;
  reminder_kind: string;
  title: string;
  description: string | null;
  rrule: string | null;
  channel: string;
  next_fire_at: string | null;
  last_fired_at: string | null;
  paused: boolean;
}

export interface HealthAppointment {
  id: string;
  user_id: string;
  provider_name: string;
  specialty: string | null;
  appointment_at: string;
  location: string | null;
  notes: string | null;
  status: string;
}

async function requireUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");
  return user.id;
}

// ─── Profile ────────────────────────────────────────────────────
export async function fetchHealthProfile(): Promise<HealthProfile | null> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_profiles")
    .select("*").eq("user_id", uid).maybeSingle();
  if (error) throw error;
  return data as HealthProfile | null;
}

export async function upsertHealthProfile(patch: Partial<HealthProfile>): Promise<HealthProfile> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_profiles")
    .upsert({ ...patch, user_id: uid }, { onConflict: "user_id" })
    .select().single();
  if (error) throw error;
  return data as HealthProfile;
}

// ─── Metrics ────────────────────────────────────────────────────
export async function fetchMetricLogs(opts?: { kind?: string; limit?: number }): Promise<HealthMetricLog[]> {
  const uid = await requireUserId();
  let q = fromTable("health_metric_logs")
    .select("*").eq("user_id", uid)
    .order("recorded_at", { ascending: false })
    .limit(opts?.limit ?? 100);
  if (opts?.kind) q = q.eq("metric_kind", opts.kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as HealthMetricLog[];
}

export async function logMetric(input: {
  metric_kind: string;
  value_numeric?: number;
  value_text?: string;
  unit?: string;
  source?: string;
  notes?: string;
  recorded_at?: string;
  sensitivity?: string;
}): Promise<HealthMetricLog> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_metric_logs")
    .insert({ user_id: uid, source: "manual", sensitivity: "standard", ...input })
    .select().single();
  if (error) throw error;
  return data as HealthMetricLog;
}

export async function deleteMetric(id: string): Promise<void> {
  const { error } = await fromTable("health_metric_logs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Wearables ──────────────────────────────────────────────────
export async function fetchWearableConnections(): Promise<WearableConnection[]> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("wearable_connections")
    .select("*").eq("user_id", uid).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WearableConnection[];
}

export async function createWearableConnection(input: {
  provider: WearableProvider;
  account_label?: string;
  scopes?: string[];
}): Promise<WearableConnection> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("wearable_connections")
    .insert({
      user_id: uid,
      provider: input.provider,
      account_label: input.account_label ?? null,
      scopes: input.scopes ?? [],
      status: "pending",
    })
    .select().single();
  if (error) throw error;
  return data as WearableConnection;
}

export async function revokeWearableConnection(id: string): Promise<void> {
  const { error } = await fromTable("wearable_connections")
    .update({ status: "revoked", encrypted_credentials: {} }).eq("id", id);
  if (error) throw error;
}

export async function fetchSyncEvents(connectionId?: string, limit = 25): Promise<WearableSyncEvent[]> {
  const uid = await requireUserId();
  let q = fromTable("wearable_sync_events")
    .select("*").eq("user_id", uid)
    .order("started_at", { ascending: false }).limit(limit);
  if (connectionId) q = q.eq("connection_id", connectionId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as WearableSyncEvent[];
}

export async function recordSyncAttempt(input: {
  connection_id: string;
  status: "success" | "error";
  signal_count?: number;
  error_message?: string;
}): Promise<WearableSyncEvent> {
  const uid = await requireUserId();
  const now = new Date().toISOString();
  const { data, error } = await fromTable("wearable_sync_events")
    .insert({
      user_id: uid,
      connection_id: input.connection_id,
      started_at: now,
      completed_at: now,
      status: input.status,
      signal_count: input.signal_count ?? 0,
      error_message: input.error_message ?? null,
    })
    .select().single();
  if (error) throw error;
  await fromTable("wearable_connections")
    .update({ last_sync_at: now, status: input.status === "success" ? "connected" : "error" })
    .eq("id", input.connection_id);
  return data as WearableSyncEvent;
}

// ─── Reminders ──────────────────────────────────────────────────
export async function fetchReminders(): Promise<HealthReminder[]> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_reminders")
    .select("*").eq("user_id", uid).order("next_fire_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as HealthReminder[];
}

export async function createReminder(input: Partial<HealthReminder> & { title: string }): Promise<HealthReminder> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_reminders")
    .insert({ user_id: uid, reminder_kind: "medication", channel: "in_app", paused: false, ...input })
    .select().single();
  if (error) throw error;
  return data as HealthReminder;
}

export async function toggleReminderPause(id: string, paused: boolean): Promise<void> {
  const { error } = await fromTable("health_reminders").update({ paused }).eq("id", id);
  if (error) throw error;
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await fromTable("health_reminders").delete().eq("id", id);
  if (error) throw error;
}

// ─── Appointments ──────────────────────────────────────────────
export async function fetchAppointments(): Promise<HealthAppointment[]> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_appointments")
    .select("*").eq("user_id", uid).order("appointment_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as HealthAppointment[];
}

export async function createAppointment(input: Partial<HealthAppointment> & {
  provider_name: string; appointment_at: string;
}): Promise<HealthAppointment> {
  const uid = await requireUserId();
  const { data, error } = await fromTable("health_appointments")
    .insert({ user_id: uid, status: "scheduled", ...input })
    .select().single();
  if (error) throw error;
  return data as HealthAppointment;
}

export async function cancelAppointment(id: string): Promise<void> {
  const { error } = await fromTable("health_appointments")
    .update({ status: "cancelled" }).eq("id", id);
  if (error) throw error;
}