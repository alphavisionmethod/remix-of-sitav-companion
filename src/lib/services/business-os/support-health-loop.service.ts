// ═══════════════════════════════════════════════════════════════
// Phase 5 — Support → Health Signal Loop
//
// When a support case resolves, the customer's relationship-health
// dimension should reflect the outcome. This service is the canonical
// emitter — there is no existing helper that bridges support_cases
// to business_health_scores, so it is introduced here (justified).
//
// The function is idempotent on `source_support_case_id`: re-emitting
// for the same case updates the existing signal instead of stacking.
//
// Anti-duplication: reuses `fromTable` for all writes; emits via the
// canonical `business_health_scores` table introduced for adaptive
// profile signal aggregation.
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface ResolvedCase {
  id: string;
  user_id: string;
  priority?: string | null;
  category?: string | null;
  resolution?: string | null;
  crm_contact_id?: string | null;
  crm_company_id?: string | null;
  resolved_at?: string | null;
}

/**
 * Map case priority + resolution sentiment to a health-score delta in [0,1].
 * Higher score = healthier relationship after this resolution.
 */
function scoreFromCase(caseRow: ResolvedCase): {
  score: number;
  trend: "rising" | "stable" | "falling";
  contributing: Record<string, unknown>;
} {
  const priority = (caseRow.priority ?? "normal").toLowerCase();
  const resolution = (caseRow.resolution ?? "").toLowerCase();

  // A swift resolution on a critical issue restores trust strongly.
  // A drawn-out "workaround"-only resolution keeps the score neutral.
  let base = 0.7;
  if (priority === "critical" || priority === "urgent") base = 0.55;
  if (priority === "low") base = 0.85;

  if (resolution.includes("won") || resolution.includes("retained") || resolution.includes("upgraded")) base += 0.15;
  if (resolution.includes("workaround") || resolution.includes("partial")) base -= 0.05;
  if (resolution.includes("churn") || resolution.includes("lost") || resolution.includes("refund")) base -= 0.25;

  const score = Math.max(0, Math.min(1, base));
  const trend = score >= 0.75 ? "rising" : score <= 0.5 ? "falling" : "stable";

  return {
    score,
    trend,
    contributing: {
      kind: "support_case_resolution",
      case_id: caseRow.id,
      priority,
      category: caseRow.category ?? "general",
      resolution_summary: caseRow.resolution ?? "",
    },
  };
}

/**
 * Emit a relationship-health signal for a resolved support case.
 * Idempotent on `source_support_case_id` — the same case never
 * stacks into multiple rows; subsequent resolutions update in place.
 */
export async function emitHealthSignalForResolvedCase(
  caseRow: ResolvedCase,
): Promise<{ ok: true; signalId: string } | { ok: false; reason: string }> {
  if (!caseRow.id || !caseRow.user_id) {
    return { ok: false, reason: "missing_case_or_user" };
  }
  // We attribute to the contact when available, fall back to company.
  if (!caseRow.crm_contact_id && !caseRow.crm_company_id) {
    return { ok: false, reason: "no_crm_attribution" };
  }

  const { score, trend, contributing } = scoreFromCase(caseRow);

  // Idempotency check.
  const { data: existing } = await fromTable("business_health_scores")
    .select("id, score")
    .eq("source_support_case_id", caseRow.id)
    .maybeSingle();

  if (existing?.id) {
    await fromTable("business_health_scores")
      .update({
        previous_score: (existing as Record<string, unknown>).score as number,
        score,
        trend,
        contributing_signals: [contributing],
        scored_at: new Date().toISOString(),
      } as never)
      .eq("id", (existing as Record<string, unknown>).id as string);
    return { ok: true, signalId: (existing as Record<string, unknown>).id as string };
  }

  const { data: inserted, error } = await fromTable("business_health_scores")
    .insert({
      user_id: caseRow.user_id,
      dimension: "relationship",
      score,
      trend,
      contributing_signals: [contributing],
      crm_contact_id: caseRow.crm_contact_id ?? null,
      crm_company_id: caseRow.crm_company_id ?? null,
      source_support_case_id: caseRow.id,
    } as never)
    .select("id")
    .single();

  if (error || !inserted?.id) {
    return { ok: false, reason: error?.message ?? "insert_failed" };
  }
  return { ok: true, signalId: (inserted as Record<string, unknown>).id as string };
}