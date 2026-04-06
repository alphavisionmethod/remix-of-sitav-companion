// ═══════════════════════════════════════════════════════════════
// SITA OS — Recommendation Loop Service
// Closed-loop lifecycle: recommend → score → approve → execute → verify
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

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
  const { data: rec, error: fetchErr } = await (supabase as any)
    .from("ai_workforce_recommendations")
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

  const { error } = await (supabase as any)
    .from("ai_workforce_recommendations")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function bindToExecution(recommendationId: string, executionRef: string) {
  const { error } = await (supabase as any)
    .from("ai_workforce_recommendations")
    .update({
      execution_binding_status: "bound",
      status: "bound_to_execution",
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendationId);
  if (error) throw error;
}

export async function bindToRemediationProgram(recommendationId: string, programId: string) {
  const { error } = await (supabase as any)
    .from("ai_workforce_recommendations")
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("outcome_verifications")
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
  await (supabase as any)
    .from("ai_workforce_recommendations")
    .update({
      outcome_verification_id: data.id,
      status: "outcome_verified",
      execution_binding_status: "verified",
      updated_at: new Date().toISOString(),
    })
    .eq("id", recommendationId);

  return data;
}

export async function fetchRemediationPrograms() {
  const { data, error } = await (supabase as any)
    .from("remediation_programs")
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
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("remediation_programs")
    .insert({ ...program, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchOutcomeVerifications() {
  const { data, error } = await (supabase as any)
    .from("outcome_verifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export function getValidTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}
