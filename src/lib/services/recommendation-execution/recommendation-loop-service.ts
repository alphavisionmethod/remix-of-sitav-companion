// ═══════════════════════════════════════════════════════════════
// SITA OS — Recommendation Loop Service
// Closed-loop lifecycle: recommend → score → approve → execute → verify
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["triaged", "under_review", "rejected", "deferred", "closed_no_action"],
  triaged: ["under_review", "rejected", "deferred"],
  under_review: ["approved", "rejected", "deferred"],
  approved: ["bound_to_execution", "closed_no_action"],
  rejected: ["new"], // allow reopening
  deferred: ["new", "under_review"],
  bound_to_execution: ["in_execution"],
  in_execution: ["executed", "bound_to_execution"], // allow retry
  executed: ["outcome_verified", "closed_no_action"],
  outcome_verified: ["closed_no_action"],
  closed_no_action: [],
};

export async function advanceRecommendationLifecycle(id: string, newStatus: string) {
  const { data: rec, error: fetchErr } = await fromDynamicTable("ai_workforce_recommendations")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!rec) throw new Error("Recommendation not found");

  const currentStatus = rec.status || "new";
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(", ")}`);
  }

  const { error } = await fromDynamicTable("ai_workforce_recommendations")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function bindToExecution(recommendationId: string, executionRef: string) {
  const { error } = await fromDynamicTable("ai_workforce_recommendations")
    .update({
      execution_binding_status: "bound",
      status: "bound_to_execution",
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendationId);
  if (error) throw error;
}

export async function bindToRemediationProgram(recommendationId: string, programId: string) {
  const { error } = await fromDynamicTable("ai_workforce_recommendations")
    .update({
      linked_remediation_program_id: programId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendationId);
  if (error) throw error;
}

export async function verifyOutcome(
  recommendationId: string,
  verification: {
    execution_ref?: string;
    expected_improvement?: string;
    actual_improvement?: string;
    journey_delta?: Record<string, unknown>;
    launch_truth_delta?: Record<string, unknown>;
    score_adjustment?: number;
    verifier_notes?: string;
  }
) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromDynamicTable("outcome_verifications")
    .insert({
      user_id: user.id,
      recommendation_id: recommendationId,
      ...verification,
      verified: true,
      verified_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;

  // Link back to recommendation
  await fromDynamicTable("ai_workforce_recommendations")
    .update({
      outcome_verification_id: data.id,
      status: "outcome_verified",
      execution_binding_status: "verified",
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendationId);

  return data;
}

// ── Execution Bindings ──

export async function createExecutionBinding(binding: {
  recommendation_id: string;
  binding_type: string;
  linked_program_id?: string;
  linked_task_id?: string;
  owner_team?: string;
  due_at?: string;
  notes?: string;
}) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromDynamicTable("recommendation_execution_bindings")
    .insert({ ...binding, user_id: user.id })
    .select()
    .single();
  if (error) throw error;

  // Update recommendation lifecycle
  await fromDynamicTable("ai_workforce_recommendations")
    .update({
      lifecycle_status: "bound_to_execution",
      execution_binding_status: "bound",
      execution_required: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", binding.recommendation_id);

  return data;
}

export async function fetchExecutionBindings(recommendationId?: string) {
  let query = fromDynamicTable("recommendation_execution_bindings")
    .select("*")
    .order("created_at", { ascending: false });
  if (recommendationId) query = query.eq("recommendation_id", recommendationId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function logExecutionEvent(event: {
  binding_id: string;
  event_type: string;
  summary: string;
  details?: Record<string, unknown>;
}) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await fromDynamicTable("recommendation_execution_events")
    .insert({ ...event, user_id: user.id, created_by_user_id: user.id });
  if (error) throw error;
}

export async function fetchExecutionEvents(bindingId: string) {
  const { data, error } = await fromDynamicTable("recommendation_execution_events")
    .select("*")
    .eq("binding_id", bindingId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

// ── Learning Signals ──

export async function recordLearningSignal(signal: {
  recommendation_id: string;
  signal_type: string;
  signal_strength: number;
  signal_source: string;
  notes?: string;
}) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await fromDynamicTable("recommendation_learning_signals")
    .insert({ ...signal, user_id: user.id });
  if (error) throw error;
}

export async function fetchLearningSignals(recommendationId: string) {
  const { data, error } = await fromDynamicTable("recommendation_learning_signals")
    .select("*")
    .eq("recommendation_id", recommendationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Outcome Verifications (new table) ──

export async function createOutcomeVerification(verification: {
  recommendation_id: string;
  binding_id?: string;
  verification_method: string;
  expected_improvement: string;
  actual_improvement?: string;
  customer_journey_delta?: string;
  launch_truth_delta?: string;
  notes?: string;
}) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromDynamicTable("recommendation_outcome_verifications")
    .insert({ ...verification, user_id: user.id })
    .select()
    .single();
  if (error) throw error;

  // Update lifecycle
  await fromDynamicTable("ai_workforce_recommendations")
    .update({
      lifecycle_status: "outcome_verified",
      outcome_verification_required: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", verification.recommendation_id);

  return data;
}

export async function fetchOutcomeVerificationsNew(recommendationId?: string) {
  let query = fromDynamicTable("recommendation_outcome_verifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (recommendationId) query = query.eq("recommendation_id", recommendationId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Remediation Tasks ──

export async function createRemediationTask(task: {
  program_id?: string;
  task_key: string;
  display_name: string;
  description: string;
  execution_type: string;
  owner_team?: string;
  related_route_key?: string;
  related_service_key?: string;
  related_flagship_loop_key?: string;
}) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromDynamicTable("remediation_tasks")
    .insert({ ...task, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchRemediationTasks(programId?: string) {
  let query = fromDynamicTable("remediation_tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (programId) query = query.eq("program_id", programId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Existing functions (kept) ──

export async function fetchRemediationPrograms() {
  const { data, error } = await fromDynamicTable("remediation_programs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createRemediationProgram(program: {
  program_key: string;
  title: string;
  focus_area: string;
  linked_flagship_loop?: string;
  display_name?: string;
  description?: string;
  owner_team?: string;
  launch_impact_class?: string;
}) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await fromDynamicTable("remediation_programs")
    .insert({ ...program, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchOutcomeVerifications() {
  const { data, error } = await fromDynamicTable("outcome_verifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export function getValidTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

// ── Pipeline Summary ──

export async function fetchClosureSummary() {
  const { data, error } = await fromDynamicTable("v_recommendation_closure_summary")
    .select("*");
  if (error) throw error;
  return data || [];
}

export async function fetchExecutionPipeline() {
  const { data, error } = await fromDynamicTable("v_recommendation_execution_pipeline")
    .select("*");
  if (error) throw error;
  return data || [];
}

