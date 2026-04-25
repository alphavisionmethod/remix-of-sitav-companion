// ═══════════════════════════════════════════════════════════════
// SITA OS — OS-State Signal Bus (Phase 1 of Autonomy Roadmap)
// Canonical client-side API for emitting & subscribing to signals
// that drive autonomous advisor controllers.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SignalSeverity = "info" | "low" | "medium" | "high" | "critical";

/**
 * Canonical signal kinds emitted across the OS. Adding a new kind?
 * - Add it here so TypeScript callers stay safe.
 * - Wire an emitter from the relevant subsystem (cash, inbox, calendar, ops).
 * - Add it to DEFAULT_SUBSCRIPTIONS below if a default advisor should listen.
 */
export const SIGNAL_KINDS = {
  // Cash & finance
  CASH_RUNWAY_DIP: "cash.runway_dip",
  CASH_BURN_SPIKE: "cash.burn_spike",
  CASH_INFLOW_DROP: "cash.inflow_drop",
  AR_OVERDUE_SPIKE: "ar.overdue_spike",
  AP_DUE_SOON: "ap.due_soon",
  // Inbox / comms
  INBOX_BACKLOG_SPIKE: "inbox.spike",
  INBOX_VIP_UNANSWERED: "inbox.vip_unanswered",
  INBOX_THREAD_STALLED: "inbox.thread_stalled",
  // Calendar
  CALENDAR_CONFLICT: "calendar.conflict",
  CALENDAR_OVERBOOKED: "calendar.overbooked",
  CALENDAR_PREP_GAP: "calendar.prep_gap",
  // Operations / pipeline
  OPS_ANOMALY: "ops.anomaly",
  PIPELINE_STALL: "pipeline.stall",
  CHURN_RISK: "customer.churn_risk",
  // Marketing
  CAMPAIGN_UNDERPERFORMING: "marketing.campaign_underperforming",
  // People
  HIRE_PENDING_DECISION: "people.hire_pending",
  // Strategy
  GOAL_DRIFT: "strategy.goal_drift",
} as const;

export type SignalKind = (typeof SIGNAL_KINDS)[keyof typeof SIGNAL_KINDS];

export type EmitSignalInput = {
  kind: SignalKind | string;
  source: string;
  summary: string;
  severity?: SignalSeverity;
  payload?: Record<string, unknown>;
  suggestedAdvisorIds?: string[];
  suggestedActionClass?: string;
  expiresInDays?: number;
};

export type OSStateSignal =
  Database["public"]["Tables"]["os_state_signals"]["Row"];

/** Minimum severity ordering for filtering subscriptions. */
const SEVERITY_RANK: Record<SignalSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function compareSeverity(a: SignalSeverity, b: SignalSeverity): number {
  return SEVERITY_RANK[a] - SEVERITY_RANK[b];
}

/**
 * Emit a signal into the bus. Idempotent only by callers — the bus does not
 * dedupe; emit sparingly (rate-limit at the source).
 */
export async function emitSignal(input: EmitSignalInput): Promise<{
  ok: boolean;
  signalId?: string;
  error?: string;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" };

  const expiresAt = new Date(
    Date.now() + (input.expiresInDays ?? 30) * 86400_000,
  ).toISOString();

  const { data, error } = await supabase
    .from("os_state_signals")
    .insert({
      user_id: userId,
      signal_kind: input.kind,
      source: input.source,
      severity: input.severity ?? "info",
      summary: input.summary,
      payload: (input.payload ?? {}) as Database["public"]["Tables"]["os_state_signals"]["Insert"]["payload"],
      suggested_advisor_ids: (input.suggestedAdvisorIds ?? []) as Database["public"]["Tables"]["os_state_signals"]["Insert"]["suggested_advisor_ids"],
      suggested_action_class: input.suggestedActionClass ?? null,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, signalId: data.id };
}

/** Default subscriptions seeded the first time an advisor row is touched. */
export const DEFAULT_SUBSCRIPTIONS: Array<{
  advisorId: string;
  signalKinds: SignalKind[];
  minSeverity: SignalSeverity;
}> = [
  {
    advisorId: "cfo-advisor",
    signalKinds: [
      SIGNAL_KINDS.CASH_RUNWAY_DIP,
      SIGNAL_KINDS.CASH_BURN_SPIKE,
      SIGNAL_KINDS.CASH_INFLOW_DROP,
      SIGNAL_KINDS.AR_OVERDUE_SPIKE,
      SIGNAL_KINDS.AP_DUE_SOON,
    ],
    minSeverity: "low",
  },
  {
    advisorId: "coo-advisor",
    signalKinds: [SIGNAL_KINDS.OPS_ANOMALY, SIGNAL_KINDS.PIPELINE_STALL],
    minSeverity: "low",
  },
  {
    advisorId: "cmo-advisor",
    signalKinds: [SIGNAL_KINDS.CAMPAIGN_UNDERPERFORMING, SIGNAL_KINDS.CHURN_RISK],
    minSeverity: "low",
  },
  {
    advisorId: "chro-advisor",
    signalKinds: [SIGNAL_KINDS.HIRE_PENDING_DECISION],
    minSeverity: "low",
  },
  {
    advisorId: "concierge-advisor",
    signalKinds: [
      SIGNAL_KINDS.INBOX_BACKLOG_SPIKE,
      SIGNAL_KINDS.INBOX_VIP_UNANSWERED,
      SIGNAL_KINDS.INBOX_THREAD_STALLED,
      SIGNAL_KINDS.CALENDAR_CONFLICT,
      SIGNAL_KINDS.CALENDAR_OVERBOOKED,
      SIGNAL_KINDS.CALENDAR_PREP_GAP,
    ],
    minSeverity: "low",
  },
  {
    advisorId: "ceo-advisor",
    signalKinds: [SIGNAL_KINDS.GOAL_DRIFT],
    minSeverity: "medium",
  },
];

/** Lazy-seed the user's default subscriptions if none exist. Safe to call repeatedly. */
export async function ensureDefaultSubscriptions(): Promise<{ ok: boolean; seeded: number }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, seeded: 0 };

  const { count } = await supabase
    .from("os_state_signal_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) > 0) return { ok: true, seeded: 0 };

  const rows = DEFAULT_SUBSCRIPTIONS.flatMap((s) =>
    s.signalKinds.map((kind) => ({
      user_id: userId,
      advisor_id: s.advisorId,
      signal_kind: kind,
      min_severity: s.minSeverity,
      enabled: true,
    })),
  );

  const { error } = await supabase
    .from("os_state_signal_subscriptions")
    .insert(rows);
  if (error) return { ok: false, seeded: 0 };
  return { ok: true, seeded: rows.length };
}

/** Fetch unacted signals an advisor is subscribed to. Used by the controller. */
export async function fetchSignalsForAdvisor(
  advisorId: string,
  opts: { limit?: number; minSeverity?: SignalSeverity } = {},
): Promise<OSStateSignal[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];

  // Get this advisor's subscription kinds
  const { data: subs } = await supabase
    .from("os_state_signal_subscriptions")
    .select("signal_kind, min_severity")
    .eq("user_id", userId)
    .eq("advisor_id", advisorId)
    .eq("enabled", true);

  if (!subs || subs.length === 0) return [];

  const kindMin = new Map<string, SignalSeverity>();
  for (const s of subs) kindMin.set(s.signal_kind, (s.min_severity as SignalSeverity) ?? "low");

  const { data: signals } = await supabase
    .from("os_state_signals")
    .select("*")
    .eq("user_id", userId)
    .eq("acted_on", false)
    .in("signal_kind", Array.from(kindMin.keys()))
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 50);

  if (!signals) return [];

  const minSeverity = opts.minSeverity;
  return signals.filter((sig) => {
    const reqMin = kindMin.get(sig.signal_kind) ?? "low";
    if (minSeverity && compareSeverity(sig.severity as SignalSeverity, minSeverity) < 0)
      return false;
    return compareSeverity(sig.severity as SignalSeverity, reqMin) >= 0;
  });
}

/** Mark a signal as acted on (called by controllers after handling). */
export async function markSignalActedOn(
  signalId: string,
  advisorId: string,
): Promise<void> {
  await supabase
    .from("os_state_signals")
    .update({
      acted_on: true,
      acted_on_at: new Date().toISOString(),
      acted_on_by_advisor_id: advisorId,
    })
    .eq("id", signalId);
}

/** Subscribe to realtime new-signal events for the current user. */
export function subscribeToSignals(
  onSignal: (signal: OSStateSignal) => void,
): () => void {
  const channel = supabase
    .channel("os-state-signals-feed")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "os_state_signals" },
      (payload) => onSignal(payload.new as OSStateSignal),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}