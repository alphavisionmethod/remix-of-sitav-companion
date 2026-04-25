// ═══════════════════════════════════════════════════════════════
// SITA OS — Dry-Run Gate (Phase 2)
// Validates a ProposedPlan against the L3 reversible-only ceiling
// and the user's per-domain autonomy policy.
//
// Hard rule: irreversible plans NEVER auto-execute, regardless of
// the user's autonomy level. They always queue for approval.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { ProposedPlan } from "./proposers";

export type DryRunDecision =
  | { ok: true; mode: "auto_execute"; reason: string }
  | { ok: true; mode: "queue_for_approval"; reason: string }
  | { ok: false; mode: "blocked"; reason: string };

export type AutonomyPolicy = {
  autonomy_level: number;
  allow_client_facing: boolean;
  allow_communication: boolean;
  allow_financial: boolean;
  allow_scheduling: boolean;
  emergency_stop: boolean;
  max_financial_impact_cents: number;
  require_approval_above_confidence: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
};

/** L3 ceiling — never exceeded for autonomous execution. */
export const AUTONOMY_CEILING = 3;

export async function fetchAutonomyPolicy(
  userId: string,
  domain: string,
): Promise<AutonomyPolicy | null> {
  const { data } = await supabase
    .from("advisor_autonomy_policies")
    .select(
      "autonomy_level, allow_client_facing, allow_communication, allow_financial, allow_scheduling, emergency_stop, max_financial_impact_cents, require_approval_above_confidence, quiet_hours_start, quiet_hours_end",
    )
    .eq("user_id", userId)
    .eq("domain", domain)
    .maybeSingle();
  return (data as AutonomyPolicy) ?? null;
}

/** Pure decision function — exported for unit tests. */
export function decideExecutionMode(
  plan: ProposedPlan,
  policy: AutonomyPolicy | null,
  now: Date = new Date(),
): DryRunDecision {
  // 1) Hard ceiling — irreversible always queues.
  if (plan.riskClass === "irreversible") {
    return {
      ok: true,
      mode: "queue_for_approval",
      reason: "irreversible_actions_always_require_approval",
    };
  }

  // 2) No policy yet → default to L1 (queue everything).
  if (!policy) {
    return { ok: true, mode: "queue_for_approval", reason: "no_policy_default_l1" };
  }

  // 3) Emergency stop tripped — block entirely.
  if (policy.emergency_stop) {
    return { ok: false, mode: "blocked", reason: "emergency_stop_active" };
  }

  // 4) Cap at L3 ceiling regardless of stored level.
  const effectiveLevel = Math.min(policy.autonomy_level, AUTONOMY_CEILING);

  // 5) Below L3 → queue.
  if (effectiveLevel < AUTONOMY_CEILING) {
    return { ok: true, mode: "queue_for_approval", reason: `autonomy_level_${effectiveLevel}` };
  }

  // 6) Domain gates.
  if (plan.isClientFacing && !policy.allow_client_facing) {
    return { ok: true, mode: "queue_for_approval", reason: "client_facing_disallowed" };
  }
  if (plan.financialImpactCents > 0 && !policy.allow_financial) {
    return { ok: true, mode: "queue_for_approval", reason: "financial_disallowed" };
  }
  if (plan.financialImpactCents > policy.max_financial_impact_cents) {
    return {
      ok: true,
      mode: "queue_for_approval",
      reason: "exceeds_max_financial_impact",
    };
  }

  // 7) Confidence gate.
  if (plan.confidence < policy.require_approval_above_confidence) {
    return { ok: true, mode: "queue_for_approval", reason: "below_confidence_threshold" };
  }

  // 8) Quiet hours.
  if (inQuietHours(now, policy.quiet_hours_start, policy.quiet_hours_end)) {
    return { ok: true, mode: "queue_for_approval", reason: "quiet_hours_active" };
  }

  // 9) Risky-but-reversible at L3 → queue. Only safe-reversible auto-runs.
  if (plan.riskClass === "reversible_risky") {
    return { ok: true, mode: "queue_for_approval", reason: "reversible_risky_needs_approval" };
  }

  return { ok: true, mode: "auto_execute", reason: "passed_all_gates" };
}

function inQuietHours(now: Date, start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + (sm || 0);
  const endMin = eh * 60 + (em || 0);
  if (startMin <= endMin) return minutes >= startMin && minutes < endMin;
  // Wraps midnight.
  return minutes >= startMin || minutes < endMin;
}