// ═══════════════════════════════════════════════════════════════
// SITA OS — Signal Emitters (Phase 1)
// Pure derivations from current OS state → signals on the bus.
// Each emitter is idempotent within a 6h window: it checks for an
// existing recent unacted signal of the same kind before emitting.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { emitSignal, SIGNAL_KINDS, type SignalKind, type SignalSeverity } from "./signal-bus";

const DEDUPE_WINDOW_HOURS = 6;

async function alreadyEmittedRecently(
  userId: string,
  kind: SignalKind,
): Promise<boolean> {
  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 3600_000).toISOString();
  const { data, error } = await supabase
    .from("os_state_signals")
    .select("id")
    .eq("user_id", userId)
    .eq("signal_kind", kind)
    .eq("acted_on", false)
    .gt("created_at", since)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

async function withDedupe(
  userId: string,
  kind: SignalKind,
  fn: () => Promise<void>,
): Promise<void> {
  if (await alreadyEmittedRecently(userId, kind)) return;
  await fn();
}

// ── Cash signals ────────────────────────────────────────────────

export async function scanCashSignals(userId: string): Promise<void> {
  // Cash runway: pull most recent cash_metrics_snapshots if available
  const { data: snaps } = await supabase
    .from("cash_metrics_snapshots" as never)
    .select("runway_days, burn_rate_30d, captured_at")
    .eq("user_id" as never, userId)
    .order("captured_at" as never, { ascending: false })
    .limit(2);

  if (!snaps || snaps.length === 0) return;
  const latest = snaps[0] as { runway_days?: number; burn_rate_30d?: number };
  const previous = snaps[1] as { runway_days?: number; burn_rate_30d?: number } | undefined;

  // Runway dipped below 90 days OR dropped >15% vs previous
  if (typeof latest.runway_days === "number" && latest.runway_days > 0) {
    const runwayDip =
      latest.runway_days < 90 ||
      (previous?.runway_days &&
        previous.runway_days > 0 &&
        latest.runway_days < previous.runway_days * 0.85);
    if (runwayDip) {
      const severity: SignalSeverity =
        latest.runway_days < 30 ? "critical" : latest.runway_days < 60 ? "high" : "medium";
      await withDedupe(userId, SIGNAL_KINDS.CASH_RUNWAY_DIP, () =>
        emitSignal({
          kind: SIGNAL_KINDS.CASH_RUNWAY_DIP,
          source: "cash-monitor",
          severity,
          summary: `Cash runway is ${latest.runway_days} days — review burn and inflows.`,
          payload: {
            runway_days: latest.runway_days,
            previous_runway_days: previous?.runway_days,
          },
          suggestedAdvisorIds: ["cfo-advisor"],
          suggestedActionClass: "review_burn",
        }).then(() => undefined),
      );
    }
  }

  // Burn spike: 30d burn jumped >25% vs prior snapshot
  if (
    typeof latest.burn_rate_30d === "number" &&
    typeof previous?.burn_rate_30d === "number" &&
    previous.burn_rate_30d > 0 &&
    latest.burn_rate_30d > previous.burn_rate_30d * 1.25
  ) {
    await withDedupe(userId, SIGNAL_KINDS.CASH_BURN_SPIKE, () =>
      emitSignal({
        kind: SIGNAL_KINDS.CASH_BURN_SPIKE,
        source: "cash-monitor",
        severity: "high",
        summary: `30-day burn spiked ${Math.round(((latest.burn_rate_30d! - previous.burn_rate_30d!) / previous.burn_rate_30d!) * 100)}%.`,
        payload: {
          current_burn: latest.burn_rate_30d,
          previous_burn: previous.burn_rate_30d,
        },
        suggestedAdvisorIds: ["cfo-advisor", "ceo-advisor"],
      }).then(() => undefined),
    );
  }
}

// ── Inbox signals ───────────────────────────────────────────────

export async function scanInboxSignals(userId: string): Promise<void> {
  // Backlog spike: > 25 unread + grew vs last 24h
  const { data: rows } = await supabase
    .from("inbox_metrics_snapshots" as never)
    .select("unread_count, vip_unanswered_count, captured_at")
    .eq("user_id" as never, userId)
    .order("captured_at" as never, { ascending: false })
    .limit(2);

  if (!rows || rows.length === 0) return;
  const latest = rows[0] as { unread_count?: number; vip_unanswered_count?: number };
  const prev = rows[1] as { unread_count?: number } | undefined;

  if (
    typeof latest.unread_count === "number" &&
    latest.unread_count > 25 &&
    (!prev?.unread_count || latest.unread_count > prev.unread_count * 1.25)
  ) {
    await withDedupe(userId, SIGNAL_KINDS.INBOX_BACKLOG_SPIKE, () =>
      emitSignal({
        kind: SIGNAL_KINDS.INBOX_BACKLOG_SPIKE,
        source: "inbox-watcher",
        severity: latest.unread_count! > 100 ? "high" : "medium",
        summary: `Inbox backlog at ${latest.unread_count} unread — concierge can triage.`,
        payload: { unread_count: latest.unread_count },
        suggestedAdvisorIds: ["concierge-advisor"],
        suggestedActionClass: "triage_inbox",
      }).then(() => undefined),
    );
  }

  if (typeof latest.vip_unanswered_count === "number" && latest.vip_unanswered_count > 0) {
    await withDedupe(userId, SIGNAL_KINDS.INBOX_VIP_UNANSWERED, () =>
      emitSignal({
        kind: SIGNAL_KINDS.INBOX_VIP_UNANSWERED,
        source: "inbox-watcher",
        severity: latest.vip_unanswered_count! > 3 ? "high" : "medium",
        summary: `${latest.vip_unanswered_count} VIP message${latest.vip_unanswered_count === 1 ? "" : "s"} awaiting reply.`,
        payload: { vip_unanswered: latest.vip_unanswered_count },
        suggestedAdvisorIds: ["concierge-advisor"],
        suggestedActionClass: "draft_vip_replies",
      }).then(() => undefined),
    );
  }
}

// ── Calendar signals ────────────────────────────────────────────

export async function scanCalendarSignals(userId: string): Promise<void> {
  const { data: rows } = await supabase
    .from("calendar_health_snapshots" as never)
    .select("conflicts_count, prep_gap_count, overbooked_days, captured_at")
    .eq("user_id" as never, userId)
    .order("captured_at" as never, { ascending: false })
    .limit(1);

  if (!rows || rows.length === 0) return;
  const latest = rows[0] as {
    conflicts_count?: number;
    prep_gap_count?: number;
    overbooked_days?: number;
  };

  if (typeof latest.conflicts_count === "number" && latest.conflicts_count > 0) {
    await withDedupe(userId, SIGNAL_KINDS.CALENDAR_CONFLICT, () =>
      emitSignal({
        kind: SIGNAL_KINDS.CALENDAR_CONFLICT,
        source: "calendar-watcher",
        severity: latest.conflicts_count! > 2 ? "high" : "medium",
        summary: `${latest.conflicts_count} calendar conflict${latest.conflicts_count === 1 ? "" : "s"} this week.`,
        payload: { conflicts: latest.conflicts_count },
        suggestedAdvisorIds: ["concierge-advisor"],
        suggestedActionClass: "resolve_conflict",
      }).then(() => undefined),
    );
  }

  if (typeof latest.prep_gap_count === "number" && latest.prep_gap_count > 0) {
    await withDedupe(userId, SIGNAL_KINDS.CALENDAR_PREP_GAP, () =>
      emitSignal({
        kind: SIGNAL_KINDS.CALENDAR_PREP_GAP,
        source: "calendar-watcher",
        severity: "low",
        summary: `${latest.prep_gap_count} upcoming meeting${latest.prep_gap_count === 1 ? "" : "s"} missing prep notes.`,
        payload: { prep_gaps: latest.prep_gap_count },
        suggestedAdvisorIds: ["concierge-advisor"],
        suggestedActionClass: "draft_prep_notes",
      }).then(() => undefined),
    );
  }
}

// ── Aggregate scan: called from a periodic boot hook ───────────

export async function runAllEmitters(): Promise<{ ran: number; skipped: number }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ran: 0, skipped: 1 };

  let ran = 0;
  for (const fn of [scanCashSignals, scanInboxSignals, scanCalendarSignals]) {
    try {
      await fn(userId);
      ran += 1;
    } catch (err) {
      // Snapshots tables may not exist for every user — silent skip.
      void err;
    }
  }
  return { ran, skipped: 0 };
}