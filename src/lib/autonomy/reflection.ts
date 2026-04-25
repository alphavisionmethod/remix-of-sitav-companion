// ═══════════════════════════════════════════════════════════════
// SITA OS — Autonomy Reflection (Phase 6)
// Post-execution scoring + lesson capture for autonomous advisor
// actions. After a queue row reaches a terminal status (executed,
// rejected, failed) we score the outcome along three axes:
//   • outcome_quality        (0..1) — did it produce useful output?
//   • execution_fitness      (0..1) — did the controller obey policy?
//   • recommendation_quality (0..1) — was the proposed plan sound?
//
// Plus a `lesson_learned` summary, `owner_action` enum, and
// `pattern_tags` derived from the plan/decision. Persisted to
// `advisor_board_reflections`. Pure scoring functions live here
// so they're trivially testable.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { ProposedPlan } from "./proposers";
import type { DryRunDecision } from "./dry-run";
import type { SimulatedReceipt } from "./simulation";

export type TerminalStatus = "executed" | "rejected" | "failed" | "expired";

export type OwnerAction =
  | "auto_executed"
  | "approved"
  | "rejected"
  | "ignored"
  | "failed_no_owner";

export type ReflectionInput = {
  advisorId: string;
  domain: string;
  actionKey: string;
  status: TerminalStatus;
  ownerAction: OwnerAction;
  riskClass: ProposedPlan["riskClass"];
  confidence: number;
  decision: DryRunDecision["mode"];
  decisionReason: string;
  policyWarnings: string[];
  errorMessage?: string | null;
  isClientFacing: boolean;
  draftOnly: boolean;
  financialImpactCents: number;
};

export type ReflectionScores = {
  outcomeQuality: number;
  executionFitness: number;
  recommendationQuality: number;
  shouldRepeat: boolean;
  lessonLearned: string;
  patternTags: string[];
  outcomeObserved: string;
};

/** Pure scoring — no DB access, no side effects. */
export function scoreReflection(input: ReflectionInput): ReflectionScores {
  const tags: string[] = [
    `risk:${input.riskClass}`,
    `decision:${input.decision}`,
    `owner:${input.ownerAction}`,
  ];
  if (input.isClientFacing) tags.push("client-facing");
  if (input.draftOnly) tags.push("draft-only");
  if (input.financialImpactCents > 0) tags.push("financial");

  // outcome_quality — was the end result useful?
  let outcomeQuality = 0.5;
  if (input.status === "executed" && input.ownerAction === "auto_executed") outcomeQuality = 0.78;
  else if (input.status === "executed" && input.ownerAction === "approved") outcomeQuality = 0.86;
  else if (input.status === "rejected") outcomeQuality = 0.18;
  else if (input.status === "failed") outcomeQuality = 0.05;
  else if (input.status === "expired") outcomeQuality = 0.25;

  // execution_fitness — did we follow policy correctly?
  // High when the dry-run decision matched the risk class. Penalize
  // any policy warnings that fired, and any failure path.
  let executionFitness = 0.9;
  if (input.policyWarnings.length > 0) {
    executionFitness -= Math.min(0.4, input.policyWarnings.length * 0.1);
  }
  if (input.status === "failed") executionFitness -= 0.4;
  if (input.riskClass === "irreversible" && input.decision === "auto_execute") {
    // This should be impossible under L3 — count it as a serious miss.
    executionFitness = 0.1;
    tags.push("policy-breach");
  }
  executionFitness = clamp01(executionFitness);

  // recommendation_quality — was the proposed plan sound?
  // Anchor on advisor confidence, adjusted by owner outcome.
  let recommendationQuality = clamp01(input.confidence);
  if (input.ownerAction === "rejected") recommendationQuality -= 0.2;
  if (input.ownerAction === "approved") recommendationQuality += 0.1;
  if (input.status === "failed") recommendationQuality -= 0.15;
  recommendationQuality = clamp01(recommendationQuality);

  const shouldRepeat =
    outcomeQuality >= 0.6 && executionFitness >= 0.6 && recommendationQuality >= 0.5;

  const lessonLearned = buildLesson(input, {
    outcomeQuality,
    executionFitness,
    recommendationQuality,
  });

  const outcomeObserved = describeOutcome(input);

  return {
    outcomeQuality: round3(outcomeQuality),
    executionFitness: round3(executionFitness),
    recommendationQuality: round3(recommendationQuality),
    shouldRepeat,
    lessonLearned,
    patternTags: tags,
    outcomeObserved,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function describeOutcome(input: ReflectionInput): string {
  switch (input.status) {
    case "executed":
      return input.ownerAction === "auto_executed"
        ? `Auto-executed reversible plan (${input.actionKey}).`
        : `Owner approved and executed (${input.actionKey}).`;
    case "rejected":
      return `Owner rejected the proposed ${input.actionKey} plan.`;
    case "failed":
      return `Execution failed: ${input.errorMessage ?? "unknown error"}.`;
    case "expired":
      return `Queue item for ${input.actionKey} expired before owner review.`;
  }
}

function buildLesson(input: ReflectionInput, s: Pick<ReflectionScores, "outcomeQuality" | "executionFitness" | "recommendationQuality">): string {
  const parts: string[] = [];
  if (input.ownerAction === "rejected") {
    parts.push("Owner rejected — this proposal pattern needs sharper triggers.");
  }
  if (input.ownerAction === "approved" && s.recommendationQuality >= 0.75) {
    parts.push("Owner approved promptly — confidence calibration looks healthy.");
  }
  if (input.status === "failed") {
    parts.push(`Execution failure (${input.errorMessage ?? "unknown"}). Investigate before re-enqueuing.`);
  }
  if (input.policyWarnings.length > 0) {
    parts.push(`Policy warnings fired: ${input.policyWarnings.slice(0, 2).join("; ")}.`);
  }
  if (input.riskClass === "irreversible" && input.decision !== "auto_execute") {
    parts.push("Correctly held under L3 ceiling — irreversible never auto-runs.");
  }
  if (parts.length === 0) {
    parts.push("Routine cycle — no anomalies. Continue current calibration.");
  }
  return parts.join(" ");
}

/**
 * Persist a reflection row. Best-effort — never throws into the
 * controller. Returns the inserted id or null.
 */
export async function persistReflection(args: {
  userId: string;
  advisorId: string;
  queueId: string | null;
  recommendationId?: string | null;
  scores: ReflectionScores;
  ownerAction: OwnerAction;
  outcomeRecordId?: string | null;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("advisor_board_reflections")
      .insert({
        user_id: args.userId,
        advisor_id: args.advisorId,
        recommendation_id: args.recommendationId ?? null,
        outcome_record_id: args.outcomeRecordId ?? null,
        owner_action: args.ownerAction,
        outcome_observed: args.scores.outcomeObserved,
        outcome_quality: args.scores.outcomeQuality,
        execution_fitness_score: args.scores.executionFitness,
        recommendation_quality_score: args.scores.recommendationQuality,
        usefulness_score: args.scores.outcomeQuality,
        should_repeat: args.scores.shouldRepeat,
        lesson_learned: args.scores.lessonLearned,
        pattern_tags: args.scores.patternTags as never,
      })
      .select("id")
      .single();
    if (error) return null;
    return data?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * High-level helper called by the controller (auto-execute) and the
 * approval queue (approve/reject). Builds the input from a queue
 * row + simulation receipt and persists the scored reflection.
 */
export async function recordReflectionForQueueRow(args: {
  userId: string;
  queueRow: {
    id: string;
    advisor_id: string;
    domain: string;
    action_type: string;
    confidence: number;
    status: TerminalStatus;
    error_message?: string | null;
    payload: Record<string, unknown> | null;
  };
  ownerAction: OwnerAction;
  simulation?: Pick<SimulatedReceipt, "policyWarnings"> | null;
}): Promise<string | null> {
  const { queueRow, ownerAction, userId, simulation } = args;
  const payload = (queueRow.payload ?? {}) as {
    risk_class?: ProposedPlan["riskClass"];
    is_client_facing?: boolean;
    draft_only?: boolean;
    financial_impact_cents?: number;
    dry_run_reason?: string;
  };

  const input: ReflectionInput = {
    advisorId: queueRow.advisor_id,
    domain: queueRow.domain,
    actionKey: queueRow.action_type,
    status: queueRow.status,
    ownerAction,
    riskClass: payload.risk_class ?? "reversible_safe",
    confidence: queueRow.confidence,
    decision:
      ownerAction === "auto_executed" ? "auto_execute" : "queue_for_approval",
    decisionReason: payload.dry_run_reason ?? "post_execution_scoring",
    policyWarnings: simulation?.policyWarnings ?? [],
    errorMessage: queueRow.error_message ?? null,
    isClientFacing: payload.is_client_facing ?? false,
    draftOnly: payload.draft_only ?? false,
    financialImpactCents: payload.financial_impact_cents ?? 0,
  };

  const scores = scoreReflection(input);
  return persistReflection({
    userId,
    advisorId: queueRow.advisor_id,
    queueId: queueRow.id,
    scores,
    ownerAction,
  });
}