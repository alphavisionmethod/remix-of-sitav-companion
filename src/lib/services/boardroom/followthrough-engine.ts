// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Layer 7 Follow-Through Engine
// Canonical state machine for the post-approval follow-through chain.
// Owns transitions, idempotency, timeline emission, and linkage writes.
// Sole entry point: dispatch / recordExecution / recordOutcome / recordReflection.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type FollowthroughState =
  | "none"
  | "approved"
  | "dispatch_pending"
  | "dispatched"
  | "executing"
  | "executed"
  | "receipt_recorded"
  | "outcome_pending"
  | "outcome_tracked"
  | "reflected"
  | "closed"
  | "failed";

export type OutcomeStatus = "pending" | "success" | "partial" | "failed" | "rolled_back";

export interface DispatchInput {
  boardroomItemId: string;
  recommendationId?: string;
  approvalQueueId?: string;
  approvedBy?: string;
  riskTier?: "standard" | "elevated" | "critical";
  actionType: string;
  actionPayload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DispatchRow {
  id: string;
  user_id: string;
  boardroom_item_id: string;
  recommendation_id: string | null;
  approval_queue_id: string | null;
  correlation_id: string;
  state: FollowthroughState;
  risk_tier: string;
  action_type: string;
  action_payload: Record<string, unknown>;
  command_id: string | null;
  command_step_id: string | null;
  execution_started_at: string | null;
  execution_completed_at: string | null;
  execution_result: Record<string, unknown> | null;
  receipt_id: string | null;
  outcome_record_id: string | null;
  retry_count: number;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OutcomeRow {
  id: string;
  dispatch_id: string;
  boardroom_item_id: string;
  outcome_status: OutcomeStatus;
  expected_outcome: string;
  actual_outcome: string;
  affected_entities: unknown[];
  confidence: number;
  verification_source: string;
  retry_required: boolean;
}

const newCorrelationId = () =>
  `cor_brd_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

// ── Transition primitive ────────────────────────────────────────

async function transition(
  itemId: string,
  toState: FollowthroughState,
  correlationId: string,
  failureReason?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.rpc("brd_followthrough_transition", {
    _item_id: itemId,
    _to_state: toState,
    _correlation_id: correlationId,
    _failure_reason: failureReason ?? null,
    _metadata: (metadata ?? {}) as never,
  });
  if (error) {
    throw new Error(`followthrough transition failed (${toState}): ${error.message}`);
  }
}

// ── Phase A: create the dispatch row when approval is captured ──

export async function createDispatch(input: DispatchInput): Promise<DispatchRow> {
  const correlationId = newCorrelationId();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("not authenticated");

  const { data, error } = await supabase
    .from("boardroom_followthrough_dispatches")
    .insert({
      user_id: userId,
      boardroom_item_id: input.boardroomItemId,
      recommendation_id: input.recommendationId ?? null,
      approval_queue_id: input.approvalQueueId ?? null,
      approved_by: input.approvedBy ?? userId,
      correlation_id: correlationId,
      risk_tier: input.riskTier ?? "standard",
      action_type: input.actionType,
      action_payload: input.actionPayload as never,
      metadata: (input.metadata ?? {}) as never,
      state: "dispatch_pending",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`failed to create dispatch: ${error?.message ?? "unknown"}`);
  }

  // Backlink dispatch to item + transition state
  await supabase
    .from("boardroom_items")
    .update({ dispatch_id: data.id, followthrough_state: "dispatch_pending" })
    .eq("id", input.boardroomItemId);

  await transition(input.boardroomItemId, "dispatch_pending", correlationId, undefined, {
    dispatch_id: data.id,
    risk_tier: input.riskTier ?? "standard",
  });

  return data as DispatchRow;
}

// ── Phase B: mark dispatched (handed to executor) ───────────────

export async function markDispatched(
  dispatchId: string,
  commandId?: string,
): Promise<void> {
  const { data: dispatch, error } = await supabase
    .from("boardroom_followthrough_dispatches")
    .update({
      state: "dispatched",
      command_id: commandId ?? null,
    })
    .eq("id", dispatchId)
    .select("boardroom_item_id, correlation_id")
    .single();
  if (error || !dispatch) throw new Error(`markDispatched failed: ${error?.message}`);
  await transition(dispatch.boardroom_item_id, "dispatched", dispatch.correlation_id);
}

// ── Phase C: mark executing / executed ──────────────────────────

export async function markExecuting(dispatchId: string, commandStepId?: string): Promise<void> {
  const { data, error } = await supabase
    .from("boardroom_followthrough_dispatches")
    .update({
      state: "executing",
      execution_started_at: new Date().toISOString(),
      command_step_id: commandStepId ?? null,
    })
    .eq("id", dispatchId)
    .select("boardroom_item_id, correlation_id")
    .single();
  if (error || !data) throw new Error(`markExecuting failed: ${error?.message}`);
  await supabase
    .from("boardroom_items")
    .update({ execution_command_step_id: commandStepId ?? null })
    .eq("id", data.boardroom_item_id);
  await transition(data.boardroom_item_id, "executing", data.correlation_id);
}

export async function markExecuted(
  dispatchId: string,
  result: Record<string, unknown>,
  receiptId?: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("boardroom_followthrough_dispatches")
    .update({
      state: receiptId ? "receipt_recorded" : "executed",
      execution_completed_at: new Date().toISOString(),
      execution_result: result as never,
      receipt_id: receiptId ?? null,
    })
    .eq("id", dispatchId)
    .select("boardroom_item_id, correlation_id")
    .single();
  if (error || !data) throw new Error(`markExecuted failed: ${error?.message}`);

  await transition(
    data.boardroom_item_id,
    receiptId ? "receipt_recorded" : "executed",
    data.correlation_id,
    undefined,
    { receipt_id: receiptId },
  );

  // Move to outcome_pending so outcome tracking is mandatory
  await supabase
    .from("boardroom_followthrough_dispatches")
    .update({ state: "outcome_pending" })
    .eq("id", dispatchId);
  await transition(data.boardroom_item_id, "outcome_pending", data.correlation_id);
}

export async function markFailed(dispatchId: string, reason: string): Promise<void> {
  const { data, error } = await supabase
    .from("boardroom_followthrough_dispatches")
    .update({ state: "failed", failure_reason: reason })
    .eq("id", dispatchId)
    .select("boardroom_item_id, correlation_id")
    .single();
  if (error || !data) throw new Error(`markFailed failed: ${error?.message}`);
  await transition(data.boardroom_item_id, "failed", data.correlation_id, reason);
}

// ── Phase D: outcome tracking ───────────────────────────────────

export interface RecordOutcomeInput {
  dispatchId: string;
  outcomeStatus: OutcomeStatus;
  expectedOutcome?: string;
  actualOutcome?: string;
  affectedEntities?: unknown[];
  confidence?: number;
  verificationSource?: "auto" | "operator" | "user" | "system";
  notes?: string;
  retryRequired?: boolean;
}

export async function recordOutcome(input: RecordOutcomeInput): Promise<OutcomeRow> {
  const { data: dispatch, error: derr } = await supabase
    .from("boardroom_followthrough_dispatches")
    .select("id, user_id, boardroom_item_id, correlation_id")
    .eq("id", input.dispatchId)
    .single();
  if (derr || !dispatch) throw new Error(`dispatch not found: ${derr?.message}`);

  const { data, error } = await supabase
    .from("boardroom_outcome_records")
    .insert({
      user_id: dispatch.user_id,
      boardroom_item_id: dispatch.boardroom_item_id,
      dispatch_id: dispatch.id,
      outcome_status: input.outcomeStatus,
      expected_outcome: input.expectedOutcome ?? "",
      actual_outcome: input.actualOutcome ?? "",
      affected_entities: (input.affectedEntities ?? []) as never,
      confidence: input.confidence ?? 0,
      verification_source: input.verificationSource ?? "auto",
      notes: input.notes ?? null,
      retry_required: input.retryRequired ?? false,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(`recordOutcome failed: ${error?.message}`);

  await supabase
    .from("boardroom_followthrough_dispatches")
    .update({ state: "outcome_tracked", outcome_record_id: data.id })
    .eq("id", dispatch.id);

  await supabase
    .from("boardroom_items")
    .update({
      outcome_status: input.outcomeStatus,
      outcome_recorded_at: new Date().toISOString(),
    })
    .eq("id", dispatch.boardroom_item_id);

  await transition(dispatch.boardroom_item_id, "outcome_tracked", dispatch.correlation_id, undefined, {
    outcome_status: input.outcomeStatus,
    outcome_record_id: data.id,
  });

  return data as unknown as OutcomeRow;
}

// ── Phase E: reflection ─────────────────────────────────────────

export interface RecordReflectionInput {
  dispatchId: string;
  advisorId: string;
  ownerAction?: string;
  ownerFeedback?: string;
  outcomeObserved?: string;
  outcomeQuality?: number;
  usefulnessScore?: number;
  recommendationQualityScore?: number;
  executionFitnessScore?: number;
  lessonLearned?: string;
  shouldRepeat?: boolean;
  patternTags?: string[];
}

export async function recordReflection(input: RecordReflectionInput): Promise<{ id: string }> {
  const { data: dispatch, error: derr } = await supabase
    .from("boardroom_followthrough_dispatches")
    .select("id, user_id, boardroom_item_id, recommendation_id, outcome_record_id, correlation_id, state")
    .eq("id", input.dispatchId)
    .single();
  if (derr || !dispatch) throw new Error(`dispatch not found: ${derr?.message}`);

  // Guard: reflection only valid after outcome tracked (or terminal failure)
  if (!["outcome_tracked", "failed", "reflected", "closed"].includes(dispatch.state)) {
    throw new Error(
      `reflection not allowed in state ${dispatch.state} — outcome must be tracked first`,
    );
  }

  const { data, error } = await supabase
    .from("advisor_board_reflections")
    .insert({
      user_id: dispatch.user_id,
      advisor_id: input.advisorId,
      boardroom_item_id: dispatch.boardroom_item_id,
      dispatch_id: dispatch.id,
      outcome_record_id: dispatch.outcome_record_id,
      owner_action: input.ownerAction ?? "acknowledged",
      owner_feedback: input.ownerFeedback ?? null,
      outcome_observed: input.outcomeObserved ?? null,
      outcome_quality: input.outcomeQuality ?? null,
      usefulness_score: input.usefulnessScore ?? null,
      recommendation_quality_score: input.recommendationQualityScore ?? null,
      execution_fitness_score: input.executionFitnessScore ?? null,
      lesson_learned: input.lessonLearned ?? null,
      should_repeat: input.shouldRepeat ?? null,
      pattern_tags: (input.patternTags ?? []) as never,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`recordReflection failed: ${error?.message}`);

  await supabase
    .from("boardroom_followthrough_dispatches")
    .update({ state: "reflected" })
    .eq("id", dispatch.id);

  await supabase
    .from("boardroom_items")
    .update({ reflection_id: data.id })
    .eq("id", dispatch.boardroom_item_id);

  await transition(dispatch.boardroom_item_id, "reflected", dispatch.correlation_id, undefined, {
    reflection_id: data.id,
  });

  return data;
}

// ── Phase F: close ──────────────────────────────────────────────

export async function closeFollowthrough(dispatchId: string): Promise<void> {
  const { data, error } = await supabase
    .from("boardroom_followthrough_dispatches")
    .update({ state: "closed" })
    .eq("id", dispatchId)
    .select("boardroom_item_id, correlation_id")
    .single();
  if (error || !data) throw new Error(`closeFollowthrough failed: ${error?.message}`);
  await transition(data.boardroom_item_id, "closed", data.correlation_id);
}

// ── Read helpers ────────────────────────────────────────────────

export async function getDispatchByItemId(itemId: string): Promise<DispatchRow | null> {
  const { data } = await supabase
    .from("boardroom_followthrough_dispatches")
    .select("*")
    .eq("boardroom_item_id", itemId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as DispatchRow | null) ?? null;
}

export async function listStaleDispatches(maxAgeMinutes = 30): Promise<DispatchRow[]> {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000).toISOString();
  const { data } = await supabase
    .from("boardroom_followthrough_dispatches")
    .select("*")
    .in("state", ["dispatch_pending", "dispatched", "executing", "outcome_pending"])
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true });
  return (data as DispatchRow[]) ?? [];
}

export const FOLLOWTHROUGH_STATES: FollowthroughState[] = [
  "approved",
  "dispatch_pending",
  "dispatched",
  "executing",
  "executed",
  "receipt_recorded",
  "outcome_pending",
  "outcome_tracked",
  "reflected",
  "closed",
];

export const followthroughEngine = {
  createDispatch,
  markDispatched,
  markExecuting,
  markExecuted,
  markFailed,
  recordOutcome,
  recordReflection,
  closeFollowthrough,
  getDispatchByItemId,
  listStaleDispatches,
};
