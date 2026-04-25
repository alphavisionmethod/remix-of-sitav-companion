// ═══════════════════════════════════════════════════════════════
// SITA OS — Per-Advisor Closed-Loop Controller (Phase 2)
// Cycle: scan signals → propose plan → dry-run → transition state
//        → either queue for approval (most cases) or auto-execute
//        the reversible-safe subset (L3 ceiling).
//
// All state transitions are persisted to `advisor_autonomy_state`.
// Every plan that survives dry-run is written to
// `advisor_action_queue` with `requires_approval` set per the
// dry-run decision.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fetchSignalsForAdvisor, markSignalActedOn, type OSStateSignal } from "./signal-bus";
import { proposeForSignal, type ProposedPlan } from "./proposers";
import { decideExecutionMode, fetchAutonomyPolicy, type DryRunDecision } from "./dry-run";
import {
  canTransition,
  COOLDOWN_AFTER_EXECUTE_MS,
  nextStateOnFailure,
  type AdvisorState,
} from "./state-machine";

export type ControllerCycleResult = {
  advisorId: string;
  scanned: number;
  proposed: number;
  queued: number;
  autoExecuted: number;
  blocked: number;
  finalState: AdvisorState;
  notes: string[];
};

/** Run one controller cycle for a single advisor. */
export async function runControllerCycle(advisorId: string): Promise<ControllerCycleResult> {
  const notes: string[] = [];
  const result: ControllerCycleResult = {
    advisorId,
    scanned: 0,
    proposed: 0,
    queued: 0,
    autoExecuted: 0,
    blocked: 0,
    finalState: "idle",
    notes,
  };

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    notes.push("not_authenticated");
    return result;
  }

  const stateRow = await ensureStateRow(userId, advisorId);
  if (!stateRow) {
    notes.push("state_row_unavailable");
    return result;
  }

  // Honor an open circuit breaker.
  if (
    stateRow.current_state === "circuit_open" &&
    stateRow.circuit_open_until &&
    new Date(stateRow.circuit_open_until) > new Date()
  ) {
    notes.push("circuit_open_skipping");
    result.finalState = "circuit_open";
    return result;
  }
  if (
    stateRow.current_state === "circuit_open" &&
    (!stateRow.circuit_open_until || new Date(stateRow.circuit_open_until) <= new Date())
  ) {
    await transition(userId, advisorId, "circuit_open", "idle", { resetFailures: true });
  }

  // Honor cooldown.
  if (
    stateRow.cooldown_until &&
    new Date(stateRow.cooldown_until) > new Date()
  ) {
    notes.push("cooling_down");
    result.finalState = stateRow.current_state as AdvisorState;
    return result;
  }

  // observing
  await transition(userId, advisorId, stateRow.current_state as AdvisorState, "observing");

  const signals = await fetchSignalsForAdvisor(advisorId, { limit: 5 });
  result.scanned = signals.length;
  if (signals.length === 0) {
    await transition(userId, advisorId, "observing", "idle");
    result.finalState = "idle";
    return result;
  }

  let currentState: AdvisorState = "observing";

  for (const signal of signals) {
    // proposing
    if (!(await transition(userId, advisorId, currentState, "proposing"))) break;
    currentState = "proposing";

    const plan = proposeForSignal(advisorId, signal);
    if (!plan) {
      await markSignalActedOn(signal.id, advisorId).catch(() => undefined);
      await transition(userId, advisorId, currentState, "idle");
      currentState = "idle";
      continue;
    }
    result.proposed += 1;

    // dry_run
    if (!(await transition(userId, advisorId, currentState, "dry_run"))) break;
    currentState = "dry_run";

    const policy = await fetchAutonomyPolicy(userId, plan.domain);
    const decision = decideExecutionMode(plan, policy);

    if (!decision.ok) {
      result.blocked += 1;
      notes.push(`blocked:${decision.reason}`);
      await transition(userId, advisorId, currentState, "idle");
      currentState = "idle";
      continue;
    }

    try {
      const queueId = await enqueuePlan(userId, advisorId, signal, plan, decision);
      if (decision.mode === "queue_for_approval") {
        result.queued += 1;
        await transition(userId, advisorId, currentState, "awaiting_approval", {
          lastSignalId: signal.id,
          lastActionId: queueId,
        });
        await transition(userId, advisorId, "awaiting_approval", "idle");
      } else {
        // auto_execute path — mark queue row executed (the actual work
        // is performed by the per-action executor; here we transition
        // through executing → cooling_down for the state machine).
        result.autoExecuted += 1;
        await transition(userId, advisorId, currentState, "executing", {
          lastSignalId: signal.id,
          lastActionId: queueId,
        });
        await markQueuedActionExecuted(queueId);
        await transition(userId, advisorId, "executing", "cooling_down", {
          cooldownUntil: new Date(Date.now() + COOLDOWN_AFTER_EXECUTE_MS).toISOString(),
          incSuccess: true,
        });
        currentState = "cooling_down";
        // Stop after one auto-execute per cycle to keep blast-radius tiny.
        await markSignalActedOn(signal.id, advisorId).catch(() => undefined);
        break;
      }
      await markSignalActedOn(signal.id, advisorId).catch(() => undefined);
      currentState = "idle";
    } catch (err) {
      const failures = (stateRow.consecutive_failures ?? 0) + 1;
      const recovery = nextStateOnFailure(currentState, stateRow.consecutive_failures ?? 0);
      notes.push(`failure:${err instanceof Error ? err.message : "unknown"}`);
      await transition(userId, advisorId, currentState, recovery.state, {
        circuitOpenUntil: recovery.openUntil,
        incFailure: true,
      });
      currentState = recovery.state;
      void failures;
      break;
    }
  }

  // Flush back to idle if we ended somewhere transient.
  if (currentState !== "idle" && currentState !== "cooling_down" && currentState !== "circuit_open") {
    await transition(userId, advisorId, currentState, "idle");
    currentState = "idle";
  }
  result.finalState = currentState;
  return result;
}

// ── Persistence helpers ─────────────────────────────────────────

type StateRow = {
  current_state: string;
  circuit_open_until: string | null;
  cooldown_until: string | null;
  consecutive_failures: number;
};

async function ensureStateRow(userId: string, advisorId: string): Promise<StateRow | null> {
  const { data } = await supabase
    .from("advisor_autonomy_state")
    .select("current_state, circuit_open_until, cooldown_until, consecutive_failures")
    .eq("user_id", userId)
    .eq("advisor_id", advisorId)
    .maybeSingle();
  if (data) return data as StateRow;

  const { data: created, error } = await supabase
    .from("advisor_autonomy_state")
    .insert({
      user_id: userId,
      advisor_id: advisorId,
      current_state: "idle",
    })
    .select("current_state, circuit_open_until, cooldown_until, consecutive_failures")
    .single();
  if (error) return null;
  return created as StateRow;
}

type TransitionOpts = {
  cooldownUntil?: string;
  circuitOpenUntil?: string;
  lastSignalId?: string;
  lastActionId?: string;
  incSuccess?: boolean;
  incFailure?: boolean;
  resetFailures?: boolean;
};

async function transition(
  userId: string,
  advisorId: string,
  from: AdvisorState,
  to: AdvisorState,
  opts: TransitionOpts = {},
): Promise<boolean> {
  if (from === to) return true;
  if (!canTransition(from, to)) return false;

  // Read current counters so we can increment without a race-y RPC.
  const { data: current } = await supabase
    .from("advisor_autonomy_state")
    .select("consecutive_failures, consecutive_successes")
    .eq("user_id", userId)
    .eq("advisor_id", advisorId)
    .maybeSingle();

  const failures = opts.resetFailures
    ? 0
    : opts.incFailure
    ? (current?.consecutive_failures ?? 0) + 1
    : current?.consecutive_failures ?? 0;
  const successes = opts.incSuccess
    ? (current?.consecutive_successes ?? 0) + 1
    : current?.consecutive_successes ?? 0;

  const update: Record<string, unknown> = {
    current_state: to,
    last_state_change_at: new Date().toISOString(),
    consecutive_failures: failures,
    consecutive_successes: successes,
  };
  if (opts.cooldownUntil !== undefined) update.cooldown_until = opts.cooldownUntil;
  if (opts.circuitOpenUntil !== undefined) update.circuit_open_until = opts.circuitOpenUntil;
  if (opts.lastSignalId !== undefined) update.last_signal_id = opts.lastSignalId;
  if (opts.lastActionId !== undefined) update.last_action_id = opts.lastActionId;
  if (to !== "circuit_open") update.circuit_open_until = null;
  if (to !== "cooling_down" && opts.cooldownUntil === undefined) update.cooldown_until = null;

  const { error } = await supabase
    .from("advisor_autonomy_state")
    .update(update)
    .eq("user_id", userId)
    .eq("advisor_id", advisorId);
  return !error;
}

async function enqueuePlan(
  userId: string,
  advisorId: string,
  signal: OSStateSignal,
  plan: ProposedPlan,
  decision: DryRunDecision,
): Promise<string> {
  const requiresApproval = decision.mode !== "auto_execute";
  const { data, error } = await supabase
    .from("advisor_action_queue")
    .insert({
      user_id: userId,
      advisor_id: advisorId,
      domain: plan.domain,
      action_type: plan.actionKey,
      summary: plan.summary,
      confidence: plan.confidence,
      requires_approval: requiresApproval,
      status: requiresApproval ? "awaiting_approval" : "approved",
      payload: {
        signal_id: signal.id,
        signal_kind: signal.signal_kind,
        plan_payload: plan.payload,
        risk_class: plan.riskClass,
        draft_only: plan.draftOnly,
        is_client_facing: plan.isClientFacing,
        financial_impact_cents: plan.financialImpactCents,
        dry_run_reason: decision.reason,
      } as never,
      rollback_payload: plan.rollback as never,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function markQueuedActionExecuted(queueId: string): Promise<void> {
  await supabase
    .from("advisor_action_queue")
    .update({
      status: "executed",
      executed_at: new Date().toISOString(),
    })
    .eq("id", queueId);
}

/** Run controllers for many advisors sequentially (small fan-out — keep blast radius low). */
export async function runControllersForAdvisors(
  advisorIds: string[],
): Promise<ControllerCycleResult[]> {
  const results: ControllerCycleResult[] = [];
  for (const id of advisorIds) {
    try {
      results.push(await runControllerCycle(id));
    } catch (err) {
      results.push({
        advisorId: id,
        scanned: 0,
        proposed: 0,
        queued: 0,
        autoExecuted: 0,
        blocked: 0,
        finalState: "idle",
        notes: [`error:${err instanceof Error ? err.message : "unknown"}`],
      });
    }
  }
  return results;
}

/** Default advisor set the bootstrap loop runs every cycle. */
export const DEFAULT_CONTROLLED_ADVISORS = [
  "cfo-advisor",
  "coo-advisor",
  "cmo-advisor",
  "chro-advisor",
  "concierge-advisor",
  "ceo-advisor",
];