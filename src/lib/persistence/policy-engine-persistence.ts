// ═══════════════════════════════════════════════════════════════
// SITA OS — PolicyEngine Durable Persistence Adapter
// Persists meaningful policy evaluations to os_policy_evaluations
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { PolicyEvaluationResult, PolicyContext } from "@/lib/core-services/policy-engine";

// ── Types ───────────────────────────────────────────────────────

export interface PersistedPolicyEvaluation {
  id: string;
  user_id: string;
  rule_id: string;
  rule_name: string;
  effect: string;
  context_snapshot: Record<string, unknown>;
  matched_conditions: unknown[];
  reason: string;
  domain: string | null;
  capability_id: string | null;
  risk_tier: string | null;
  action_target: string | null;
  actor_id: string | null;
  evaluation_time_ms: number | null;
  confidence: number | null;
  evaluated_rules_count: number;
  linked_action_id: string | null;
  linked_receipt_id: string | null;
  linked_approval_id: string | null;
  is_simulation: boolean;
  created_at: string;
}

// ── Helpers ─────────────────────────────────────────────────────

let _userId: string | null = null;
async function uid(): Promise<string | null> {
  if (_userId) return _userId;
  const { data: { user } } = await supabase.auth.getUser();
  _userId = user?.id ?? null;
  return _userId;
}
supabase.auth.onAuthStateChange(() => { _userId = null; });

// ── Effects worth persisting ────────────────────────────────────
// We don't persist every micro-allow. We persist meaningful decisions.

const PERSIST_WORTHY_EFFECTS = new Set([
  "deny",
  "require-approval",
  "require-dual-approval",
  "require-simulation",
]);

// ── Persist a policy evaluation ─────────────────────────────────

export async function persistPolicyEvaluation(
  result: PolicyEvaluationResult,
  context: PolicyContext,
  opts?: {
    linkedActionId?: string;
    linkedReceiptId?: string;
    linkedApprovalId?: string;
    forcePersist?: boolean;
  }
): Promise<string | null> {
  // Skip trivial allows unless forced
  if (!opts?.forcePersist && !PERSIST_WORTHY_EFFECTS.has(result.effect)) return null;

  const userId = await uid();
  if (!userId) return null;

  const { data, error } = await fromTable("os_policy_evaluations")
    .insert({
      user_id: userId,
      rule_id: result.matchedRule?.id ?? "none",
      rule_name: result.matchedRule?.name ?? "No Rule Matched",
      effect: result.effect,
      context_snapshot: context as Record<string, unknown>,
      matched_conditions: result.matchedRule?.conditions ?? [],
      reason: result.reason,
      domain: context.domain ?? null,
      capability_id: context.capabilityId ?? null,
      risk_tier: context.riskTier ?? null,
      action_target: (context as Record<string, unknown>).actionTarget ?? null,
      actor_id: context.userId ?? null,
      evaluation_time_ms: result.evaluationTimeMs,
      confidence: null,
      evaluated_rules_count: result.evaluatedRules,
      linked_action_id: opts?.linkedActionId ?? null,
      linked_receipt_id: opts?.linkedReceiptId ?? null,
      linked_approval_id: opts?.linkedApprovalId ?? null,
      is_simulation: context.isSimulation ?? false,
    })
    .select("id")
    .single();

  if (error) { console.error("[policy-persistence] insert failed:", error); return null; }
  return data?.id ?? null;
}

// ── Fetch policy evaluations ────────────────────────────────────

export async function fetchPolicyEvaluations(filters?: {
  effect?: string;
  domain?: string;
  ruleId?: string;
  linkedActionId?: string;
  isSimulation?: boolean;
  since?: string;
  limit?: number;
}): Promise<PersistedPolicyEvaluation[]> {
  const userId = await uid();
  if (!userId) return [];

  let query = fromTable("os_policy_evaluations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters?.effect) query = query.eq("effect", filters.effect);
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.ruleId) query = query.eq("rule_id", filters.ruleId);
  if (filters?.linkedActionId) query = query.eq("linked_action_id", filters.linkedActionId);
  if (filters?.isSimulation !== undefined) query = query.eq("is_simulation", filters.isSimulation);
  if (filters?.since) query = query.gte("created_at", filters.since);
  query = query.limit(filters?.limit ?? 100);

  const { data, error } = await query;
  if (error) { console.error("[policy-persistence] fetch failed:", error); return []; }
  return data ?? [];
}

// ── Get policy stats ────────────────────────────────────────────

export async function getPolicyEvaluationStats(): Promise<{
  total: number;
  byEffect: Record<string, number>;
  byDomain: Record<string, number>;
  recentDenials: number;
}> {
  const evals = await fetchPolicyEvaluations({ limit: 500 });
  const byEffect: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  let recentDenials = 0;

  for (const e of evals) {
    byEffect[e.effect] = (byEffect[e.effect] ?? 0) + 1;
    if (e.domain) byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
    if (e.effect === "deny" && e.created_at > oneDayAgo) recentDenials++;
  }

  return { total: evals.length, byEffect, byDomain, recentDenials };
}

// ── Get evaluations for an action (lineage) ─────────────────────

export async function getPolicyLineageForAction(actionId: string): Promise<PersistedPolicyEvaluation[]> {
  return fetchPolicyEvaluations({ linkedActionId: actionId });
}
