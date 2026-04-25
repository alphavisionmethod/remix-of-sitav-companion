// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Simulation (Phase 4)
// Builds a pre-execution receipt for every plan that survives the
// dry-run gate. The receipt enumerates side effects, projected
// outcomes, rollback path, and policy warnings — all *before* the
// plan is auto-executed or queued for approval.
//
// Receipts are persisted to `autonomy_simulation_receipts` and are
// linked back to the queue row via `queue_id`. The JIT approval UI
// reads them so the owner sees exactly what will happen.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { ProposedPlan } from "./proposers";
import type { DryRunDecision, AutonomyPolicy } from "./dry-run";
import type { OSStateSignal } from "./signal-bus";

/** A declared side-effect surface item. */
export type SimulatedSideEffect = {
  kind:
    | "db_write"
    | "db_read"
    | "queue_insert"
    | "external_call"
    | "client_message"
    | "calendar_change"
    | "financial_move"
    | "noop";
  target: string;
  reversible: boolean;
  description: string;
};

export type SimulatedReceipt = {
  advisorId: string;
  domain: string;
  actionKey: string;
  summary: string;
  riskClass: ProposedPlan["riskClass"];
  confidence: number;
  decision: DryRunDecision["mode"];
  decisionReason: string;
  signalId: string | null;
  signalKind: string | null;
  financialImpactCents: number;
  isClientFacing: boolean;
  draftOnly: boolean;
  projectedOutcomes: string[];
  sideEffects: SimulatedSideEffect[];
  rollbackPlan: ProposedPlan["rollback"] & { humanSummary: string };
  policyWarnings: string[];
};

/** Pure: given a plan + signal + policy + decision, build a simulation receipt. */
export function buildSimulationReceipt(args: {
  advisorId: string;
  plan: ProposedPlan;
  signal: OSStateSignal | null;
  policy: AutonomyPolicy | null;
  decision: DryRunDecision;
}): SimulatedReceipt {
  const { advisorId, plan, signal, policy, decision } = args;

  const sideEffects = inventorySideEffects(plan);
  const projectedOutcomes = projectOutcomes(plan);
  const policyWarnings = collectPolicyWarnings(plan, policy, decision);

  return {
    advisorId,
    domain: plan.domain,
    actionKey: plan.actionKey,
    summary: plan.summary,
    riskClass: plan.riskClass,
    confidence: plan.confidence,
    decision: decision.mode,
    decisionReason: decision.reason,
    signalId: signal?.id ?? null,
    signalKind: (signal?.signal_kind as string | undefined) ?? null,
    financialImpactCents: plan.financialImpactCents,
    isClientFacing: plan.isClientFacing,
    draftOnly: plan.draftOnly,
    projectedOutcomes,
    sideEffects,
    rollbackPlan: {
      ...plan.rollback,
      humanSummary: rollbackHumanSummary(plan.rollback.strategy),
    },
    policyWarnings,
  };
}

function rollbackHumanSummary(strategy: ProposedPlan["rollback"]["strategy"]): string {
  switch (strategy) {
    case "noop":
      return "Nothing to roll back — this action only reads or proposes.";
    case "delete_queued_record":
      return "On rejection, the queued draft will be removed and no work product remains.";
    case "restore_snapshot":
      return "On rejection, the prior snapshot of the affected record will be restored.";
    case "manual":
      return "This action requires a manual rollback procedure documented in the runbook.";
  }
}

/**
 * Build a per-action side-effect inventory. Conservative: assumes the
 * action will write a draft + the queue row, and never sends client-facing
 * messages on the auto-execute path under L3.
 */
export function inventorySideEffects(plan: ProposedPlan): SimulatedSideEffect[] {
  const effects: SimulatedSideEffect[] = [
    {
      kind: "queue_insert",
      target: "advisor_action_queue",
      reversible: true,
      description: `Queue row for ${plan.actionKey} (status pending dry-run mode).`,
    },
  ];

  if (plan.draftOnly) {
    effects.push({
      kind: "db_write",
      target: "advisor_board_actions / drafts",
      reversible: true,
      description: "Persist a draft work product the owner can edit or discard.",
    });
  }

  if (plan.isClientFacing) {
    effects.push({
      kind: "client_message",
      target: "external recipient (queued, not sent under L3)",
      reversible: false,
      description:
        "Action references a client-facing surface; the message will NOT be sent automatically — approval required.",
    });
  }

  if (plan.financialImpactCents > 0) {
    effects.push({
      kind: "financial_move",
      target: `value=${(plan.financialImpactCents / 100).toFixed(2)} USD`,
      reversible: plan.riskClass !== "irreversible",
      description:
        plan.riskClass === "irreversible"
          ? "Irreversible financial movement — always queues for approval."
          : "Reversible financial step (e.g. budget reservation).",
    });
  }

  if (effects.length === 1) {
    effects.push({
      kind: "noop",
      target: "—",
      reversible: true,
      description: "No additional side effects beyond the queued record.",
    });
  }

  return effects;
}

function projectOutcomes(plan: ProposedPlan): string[] {
  const out: string[] = [
    `Advisor ${plan.actionKey.split(".")[0]} produces: ${plan.summary}`,
  ];
  if (plan.draftOnly) {
    out.push("A draft is created — nothing leaves the OS until you approve.");
  }
  if (plan.financialImpactCents > 0) {
    out.push(`Estimated financial impact: $${(plan.financialImpactCents / 100).toFixed(2)}`);
  }
  if (plan.isClientFacing) {
    out.push("If you approve, the draft can be sent to a client recipient.");
  } else {
    out.push("Internal-only — no third party will see this.");
  }
  return out;
}

function collectPolicyWarnings(
  plan: ProposedPlan,
  policy: AutonomyPolicy | null,
  decision: DryRunDecision,
): string[] {
  const warnings: string[] = [];

  if (!policy) {
    warnings.push("No autonomy policy configured for this domain — defaulting to L1 (queue everything).");
  } else {
    if (policy.emergency_stop) warnings.push("Emergency stop is currently active.");
    if (plan.financialImpactCents > policy.max_financial_impact_cents) {
      warnings.push(
        `Plan financial impact ($${(plan.financialImpactCents / 100).toFixed(
          2,
        )}) exceeds per-action cap ($${(policy.max_financial_impact_cents / 100).toFixed(2)}).`,
      );
    }
    if (plan.confidence < policy.require_approval_above_confidence) {
      warnings.push(
        `Confidence ${(plan.confidence * 100).toFixed(0)}% below policy threshold ${(policy.require_approval_above_confidence * 100).toFixed(0)}%.`,
      );
    }
  }

  if (plan.riskClass === "irreversible") {
    warnings.push("Irreversible action — always requires explicit approval, regardless of autonomy level.");
  }
  if (plan.riskClass === "reversible_risky") {
    warnings.push("Reversible but risky — queued so a human can sanity-check before execution.");
  }
  if (decision.mode === "blocked") {
    warnings.push(`Blocked by dry-run: ${decision.reason}`);
  }

  return warnings;
}

/** Persist a simulation receipt and return its id. Best-effort — never throws. */
export async function persistSimulationReceipt(
  userId: string,
  receipt: SimulatedReceipt,
  queueId: string | null,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("autonomy_simulation_receipts")
      .insert({
        user_id: userId,
        advisor_id: receipt.advisorId,
        domain: receipt.domain,
        action_key: receipt.actionKey,
        summary: receipt.summary,
        risk_class: receipt.riskClass,
        confidence: receipt.confidence,
        decision: receipt.decision,
        decision_reason: receipt.decisionReason,
        signal_id: receipt.signalId,
        signal_kind: receipt.signalKind,
        queue_id: queueId,
        financial_impact_cents: receipt.financialImpactCents,
        is_client_facing: receipt.isClientFacing,
        draft_only: receipt.draftOnly,
        projected_outcomes: receipt.projectedOutcomes as never,
        side_effects: receipt.sideEffects as never,
        rollback_plan: receipt.rollbackPlan as never,
        policy_warnings: receipt.policyWarnings as never,
      })
      .select("id")
      .single();
    if (error) return null;
    return data?.id ?? null;
  } catch {
    return null;
  }
}

/** Fetch the latest simulation receipt for a queued action (for the JIT UI). */
export async function fetchSimulationForQueueItem(queueId: string) {
  const { data } = await supabase
    .from("autonomy_simulation_receipts")
    .select("*")
    .eq("queue_id", queueId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}