// ═══════════════════════════════════════════════════════════════
// SITA OS — REX Recommendation Engine
// Canonical lifecycle: create → route → bind → event → verify
// All writes hit `ai_workforce_*` tables (the real schema) and
// emit a `flagship_loop_completions` receipt for proof.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { emitLoopCompletion, type FlagshipLoopKey, type LoopStepKey } from "@/hooks/use-flagship-loop-proof";

const db = supabase as any;

export type Severity = "info" | "warning" | "critical" | "low" | "medium" | "high";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface CreateRecommendationInput {
  domain: string;
  title: string;
  summary: string;
  evidence?: unknown[];
  severity?: Severity;
  confidence?: number;
  executionRequired?: boolean;
  flagshipLoopKey?: FlagshipLoopKey;
  roleKey?: string;
  taskKey?: string;
  invocationId?: string;
}

export interface RecommendationRow {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  domain: string;
  severity: string;
  confidence: number;
  status: string;
  lifecycle_status: string;
  execution_required: boolean;
  flagship_loop_key: string | null;
  role_key: string;
  evidence: unknown[];
  created_at: string;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function emit(loop_key: FlagshipLoopKey | undefined, step_key: LoopStepKey | string, evidence?: Record<string, unknown>) {
  if (!loop_key) return;
  // Cast: step_key may be one of the canonical receipt steps OR a REX-specific one.
  await emitLoopCompletion({ loop_key, step_key: step_key as LoopStepKey, evidence });
}

/**
 * Create a recommendation row using the REAL `ai_workforce_recommendations` columns.
 */
export async function createRecommendation(input: CreateRecommendationInput): Promise<RecommendationRow | null> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Not authenticated");

  const sev: string = input.severity ?? "info";
  const flagshipLoopKey = input.flagshipLoopKey ?? "admin-truth-recommendation-approval";

  const { data, error } = await db
    .from("ai_workforce_recommendations")
    .insert({
      user_id: userId,
      role_key: input.roleKey ?? "system",
      task_key: input.taskKey ?? null,
      domain: input.domain,
      title: input.title,
      summary: input.summary,
      evidence: (input.evidence ?? []) as unknown,
      severity: sev,
      confidence: typeof input.confidence === "number" ? input.confidence : 0.8,
      status: "new",
      lifecycle_status: "new",
      execution_required: !!input.executionRequired,
      outcome_verification_required: !!input.executionRequired,
      flagship_loop_key: flagshipLoopKey,
      invocation_id: input.invocationId ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[rex] createRecommendation failed:", error);
    throw error;
  }

  await emit(flagshipLoopKey, "recommendation_created", {
    recommendation_id: data.id,
    domain: input.domain,
    severity: sev,
    execution_required: !!input.executionRequired,
  });

  return data as RecommendationRow;
}

/**
 * Route an existing recommendation to the user approval queue.
 */
export async function routeToApproval(
  recommendationId: string,
  opts?: { priority?: Priority; costImplications?: string; launchImplications?: string },
): Promise<{ id: string } | null> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Not authenticated");

  // Fetch the recommendation to copy title/summary + flagship loop
  const { data: rec, error: recErr } = await db
    .from("ai_workforce_recommendations")
    .select("id, title, summary, severity, evidence, flagship_loop_key")
    .eq("id", recommendationId)
    .maybeSingle();
  if (recErr || !rec) {
    console.error("[rex] routeToApproval: rec not found", recErr);
    return null;
  }

  const priority: Priority =
    opts?.priority ??
    (rec.severity === "critical" ? "urgent" : rec.severity === "high" ? "high" : "normal");

  const { data, error } = await db
    .from("ai_workforce_approval_queue")
    .insert({
      user_id: userId,
      recommendation_id: rec.id,
      title: rec.title,
      summary: rec.summary,
      priority,
      status: "pending",
      evidence_links: rec.evidence ?? [],
      cost_implications: opts?.costImplications ?? null,
      launch_implications: opts?.launchImplications ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[rex] routeToApproval insert failed:", error);
    throw error;
  }

  await emit(rec.flagship_loop_key as FlagshipLoopKey | undefined, "routed_to_approval", {
    recommendation_id: rec.id,
    approval_queue_item_id: data.id,
  });

  return { id: data.id };
}

/**
 * Bind an approved recommendation to an execution path.
 */
export async function bindExecution(
  recommendationId: string,
  approvalQueueItemId: string,
  opts?: { bindingType?: string; ownerTeam?: string; ownerUserId?: string; notes?: string },
): Promise<{ id: string } | null> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await db
    .from("recommendation_execution_bindings")
    .insert({
      user_id: userId,
      recommendation_id: recommendationId,
      approval_queue_item_id: approvalQueueItemId,
      binding_type: opts?.bindingType ?? "remediation_task",
      binding_status: "bound",
      owner_team: opts?.ownerTeam ?? null,
      owner_user_id: opts?.ownerUserId ?? null,
      notes: opts?.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[rex] bindExecution failed:", error);
    throw error;
  }

  // Advance recommendation lifecycle
  await db
    .from("ai_workforce_recommendations")
    .update({ lifecycle_status: "approved", approval_decision_at: new Date().toISOString(), approved_by_user_id: userId })
    .eq("id", recommendationId);

  // Mark queue item with binding link
  await db
    .from("ai_workforce_approval_queue")
    .update({ remediation_binding_id: data.id })
    .eq("id", approvalQueueItemId);

  // First execution event
  await recordExecutionEvent(data.id, "created", "Execution binding created from approved recommendation");

  // Open outcome verification
  await db.from("recommendation_outcome_verifications").insert({
    user_id: userId,
    recommendation_id: recommendationId,
    binding_id: data.id,
    verification_method: "manual_review",
    expected_improvement: "",
    verification_status: "pending",
  });

  await emit("admin-truth-recommendation-approval", "execution_bound", {
    recommendation_id: recommendationId,
    binding_id: data.id,
  });

  return { id: data.id };
}

export async function recordExecutionEvent(
  bindingId: string,
  eventType: string,
  summary: string,
  details?: Record<string, unknown>,
): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await db.from("recommendation_execution_events").insert({
    user_id: userId,
    binding_id: bindingId,
    event_type: eventType,
    summary,
    details: (details ?? {}) as unknown,
    created_by_user_id: userId,
  });
}

export async function recordOutcomeVerification(
  recommendationId: string,
  bindingId: string,
  expected: string,
  actual: string,
  status: "pending" | "verified" | "failed" = "verified",
): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await db.from("recommendation_outcome_verifications").insert({
    user_id: userId,
    recommendation_id: recommendationId,
    binding_id: bindingId,
    verification_method: "manual_review",
    expected_improvement: expected,
    actual_improvement: actual,
    verification_status: status,
    verified_by_user_id: userId,
    verified_at: status === "verified" ? new Date().toISOString() : null,
  });
  await emit("admin-truth-recommendation-approval", "outcome_verified", {
    recommendation_id: recommendationId,
    binding_id: bindingId,
    status,
  });
}

/**
 * Demo helper — create+route a sample recommendation in one click.
 */
export async function generateSampleRecommendation(): Promise<{ recommendationId: string; approvalQueueItemId: string | null }> {
  const rec = await createRecommendation({
    domain: "finance",
    title: "Reconcile Stripe payouts",
    summary: "3 payouts in the last 24h need review before close-of-books.",
    evidence: [{ source: "stripe_payouts", count: 3, since: "24h" }],
    severity: "warning",
    confidence: 0.82,
    executionRequired: true,
    flagshipLoopKey: "admin-truth-recommendation-approval",
    roleKey: "finance_steward",
    taskKey: "reconcile_payouts",
  });
  if (!rec) throw new Error("Failed to create recommendation");
  const queued = await routeToApproval(rec.id, {
    priority: "high",
    costImplications: "≤ $50 in reviewer time",
    launchImplications: "Blocks accurate close-of-books reporting",
  });
  return { recommendationId: rec.id, approvalQueueItemId: queued?.id ?? null };
}
