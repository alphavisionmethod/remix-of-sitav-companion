// ═══════════════════════════════════════════════════════════════
// SITA OS — Standing Missions (Phase 8 of Autonomy Roadmap)
// Persistent advisor mandates with cron-style or signal-driven
// triggers. Pure evaluator + thin DB driver.
//
// Hard rules:
//  - Standing missions never bypass the L3 ceiling. They emit
//    signals into the bus; the controller still decides if any
//    resulting plan executes or queues for approval.
//  - Paused missions never fire. Kill-switch / circuit_open at
//    the advisor level still applies downstream.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { emitSignal, compareSeverity, type SignalSeverity } from "./signal-bus";

export type StandingMissionRow =
  Database["public"]["Tables"]["advisor_standing_missions"]["Row"];

export type MissionTriggerKind = "interval" | "signal" | "composite";

export type MissionTriggerConfig = {
  every_minutes?: number;
  signal_kind?: string;
  min_severity?: SignalSeverity;
};

export type MissionEvaluationContext = {
  /** Current evaluation time (injectable for tests). */
  now: Date;
  /** Most-recent matching signal for signal/composite triggers. */
  recentMatchingSignal?: {
    id: string;
    severity: SignalSeverity;
    created_at: string;
  } | null;
};

export type MissionDecision =
  | { fire: true; reason: string; nextRunAt: Date }
  | { fire: false; reason: string; nextRunAt: Date };

/**
 * Pure decision: should this mission fire right now?
 * No I/O — fully deterministic given (mission, context).
 */
export function evaluateMission(
  mission: Pick<
    StandingMissionRow,
    | "trigger_kind"
    | "trigger_config"
    | "paused"
    | "last_run_at"
    | "next_run_at"
  >,
  ctx: MissionEvaluationContext,
): MissionDecision {
  const cfg = (mission.trigger_config ?? {}) as MissionTriggerConfig;
  const everyMin = Math.max(1, cfg.every_minutes ?? 60);
  const nextRunAt = new Date(ctx.now.getTime() + everyMin * 60_000);

  if (mission.paused) {
    return { fire: false, reason: "paused", nextRunAt };
  }

  const intervalElapsed = (() => {
    if (!mission.last_run_at) return true;
    const last = new Date(mission.last_run_at).getTime();
    return ctx.now.getTime() - last >= everyMin * 60_000;
  })();

  switch (mission.trigger_kind as MissionTriggerKind) {
    case "interval": {
      if (intervalElapsed) {
        return { fire: true, reason: "interval_elapsed", nextRunAt };
      }
      return { fire: false, reason: "interval_not_elapsed", nextRunAt };
    }
    case "signal": {
      if (!ctx.recentMatchingSignal) {
        return { fire: false, reason: "no_matching_signal", nextRunAt };
      }
      if (
        cfg.min_severity &&
        compareSeverity(
          ctx.recentMatchingSignal.severity,
          cfg.min_severity,
        ) < 0
      ) {
        return { fire: false, reason: "severity_below_threshold", nextRunAt };
      }
      return { fire: true, reason: "signal_matched", nextRunAt };
    }
    case "composite": {
      if (!intervalElapsed) {
        return { fire: false, reason: "interval_not_elapsed", nextRunAt };
      }
      if (!ctx.recentMatchingSignal) {
        return { fire: false, reason: "no_matching_signal", nextRunAt };
      }
      if (
        cfg.min_severity &&
        compareSeverity(
          ctx.recentMatchingSignal.severity,
          cfg.min_severity,
        ) < 0
      ) {
        return { fire: false, reason: "severity_below_threshold", nextRunAt };
      }
      return {
        fire: true,
        reason: "interval_and_signal",
        nextRunAt,
      };
    }
    default:
      return { fire: false, reason: "unknown_trigger_kind", nextRunAt };
  }
}

// ── DB driver ────────────────────────────────────────────────

/** Evaluate one mission: fetch context, decide, persist run + side effects. */
export async function runMission(missionId: string): Promise<{
  ok: boolean;
  fired: boolean;
  reason: string;
  signalId?: string;
}> {
  const { data: mission, error } = await supabase
    .from("advisor_standing_missions")
    .select("*")
    .eq("id", missionId)
    .maybeSingle();
  if (error || !mission) {
    return { ok: false, fired: false, reason: "mission_not_found" };
  }

  // Fetch matching signal if needed.
  let matching: MissionEvaluationContext["recentMatchingSignal"] = null;
  const cfg = (mission.trigger_config ?? {}) as MissionTriggerConfig;
  if (
    (mission.trigger_kind === "signal" ||
      mission.trigger_kind === "composite") &&
    cfg.signal_kind
  ) {
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { data: sigs } = await supabase
      .from("os_state_signals")
      .select("id, severity, created_at")
      .eq("user_id", mission.user_id)
      .eq("signal_kind", cfg.signal_kind)
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);
    const sig = sigs?.[0];
    if (sig) {
      matching = {
        id: sig.id,
        severity: sig.severity as SignalSeverity,
        created_at: sig.created_at,
      };
    }
  }

  const decision = evaluateMission(mission, {
    now: new Date(),
    recentMatchingSignal: matching,
  });

  let emittedSignalId: string | undefined;
  if (decision.fire) {
    const res = await emitSignal({
      kind: mission.emit_signal_kind,
      source: `standing_mission:${mission.id}`,
      summary: mission.emit_summary_template || mission.title,
      severity: mission.emit_severity as SignalSeverity,
      suggestedAdvisorIds: [mission.advisor_id],
      payload: {
        mission_id: mission.id,
        mission_title: mission.title,
        trigger_reason: decision.reason,
        upstream_signal_id: matching?.id ?? null,
      },
    });
    if (res.ok) emittedSignalId = res.signalId;
  }

  // Persist run record.
  await supabase.from("advisor_mission_runs").insert({
    mission_id: mission.id,
    user_id: mission.user_id,
    advisor_id: mission.advisor_id,
    fired: decision.fire,
    decision_reason: decision.reason,
    emitted_signal_id: emittedSignalId ?? null,
    evidence: {
      trigger_kind: mission.trigger_kind,
      matched_signal_id: matching?.id ?? null,
    } as unknown as Json,
  });

  // Update mission counters.
  await supabase
    .from("advisor_standing_missions")
    .update({
      last_run_at: new Date().toISOString(),
      next_run_at: decision.nextRunAt.toISOString(),
      run_count: (mission.run_count ?? 0) + 1,
      fire_count: (mission.fire_count ?? 0) + (decision.fire ? 1 : 0),
    })
    .eq("id", mission.id);

  return {
    ok: true,
    fired: decision.fire,
    reason: decision.reason,
    signalId: emittedSignalId,
  };
}

/** Evaluate every mission for the current user that is due or signal-driven. */
export async function runDueMissionsForCurrentUser(): Promise<{
  evaluated: number;
  fired: number;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { evaluated: 0, fired: 0 };

  const nowIso = new Date().toISOString();
  const { data: missions } = await supabase
    .from("advisor_standing_missions")
    .select("id, trigger_kind, next_run_at")
    .eq("user_id", userId)
    .eq("paused", false);

  if (!missions || missions.length === 0) return { evaluated: 0, fired: 0 };

  const due = missions.filter((m) => {
    if (m.trigger_kind === "signal") return true; // always re-check signal
    if (!m.next_run_at) return true;
    return m.next_run_at <= nowIso;
  });

  let fired = 0;
  for (const m of due) {
    const res = await runMission(m.id);
    if (res.fired) fired += 1;
  }
  return { evaluated: due.length, fired };
}

// ── Owner-facing helpers ─────────────────────────────────────

export type CreateMissionInput = {
  advisorId: string;
  title: string;
  description?: string;
  triggerKind: MissionTriggerKind;
  triggerConfig: MissionTriggerConfig;
  emitSignalKind: string;
  emitSeverity?: SignalSeverity;
  emitSummaryTemplate?: string;
};

export async function createStandingMission(
  input: CreateMissionInput,
): Promise<{ ok: boolean; missionId?: string; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: "not_authenticated" };

  const everyMin = input.triggerConfig.every_minutes ?? 60;
  const nextRunAt =
    input.triggerKind === "signal"
      ? null
      : new Date(Date.now() + everyMin * 60_000).toISOString();

  const { data, error } = await supabase
    .from("advisor_standing_missions")
    .insert({
      user_id: userId,
      advisor_id: input.advisorId,
      title: input.title,
      description: input.description ?? "",
      trigger_kind: input.triggerKind,
      trigger_config: input.triggerConfig as unknown as Json,
      emit_signal_kind: input.emitSignalKind,
      emit_severity: input.emitSeverity ?? "medium",
      emit_summary_template:
        input.emitSummaryTemplate ?? `Standing mission: ${input.title}`,
      next_run_at: nextRunAt,
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, missionId: data?.id };
}

export async function setMissionPaused(
  missionId: string,
  paused: boolean,
  reason?: string,
): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from("advisor_standing_missions")
    .update({
      paused,
      paused_reason: paused ? reason ?? "paused_by_owner" : null,
    })
    .eq("id", missionId);
  return { ok: !error };
}

export async function deleteStandingMission(
  missionId: string,
): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from("advisor_standing_missions")
    .delete()
    .eq("id", missionId);
  return { ok: !error };
}