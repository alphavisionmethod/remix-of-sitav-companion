// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Lineage Durable Persistence Adapter
// Persists the canonical 16-state action lifecycle to
// os_action_lineage with full cross-reference linkage
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { ActionRecord, ActionState, ActionStateTransition } from "@/packages/contracts/domain-types/os-unified";

// ── Types ───────────────────────────────────────────────────────

export interface PersistedActionLineage {
  id: string;
  user_id: string;
  workflow_id: string;
  domain: string;
  action_type: string | null;
  current_state: ActionState;
  state_history: ActionStateTransition[];
  assigned_advisor: string | null;
  entity_scope: Record<string, unknown>;
  rollback_eligible: boolean;
  replayable: boolean;
  blocking_reasons: string[];
  depends_on: string[];
  confidence_score: number;
  proof_ids: string[];
  linked_event_ids: string[];
  linked_memory_ids: string[];
  linked_policy_ids: string[];
  linked_receipt_ids: string[];
  initiating_surface: string | null;
  stuck_since: string | null;
  created_at: string;
  updated_at: string;
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

// ── Create action lineage ───────────────────────────────────────

export async function persistActionRecord(
  record: ActionRecord,
  opts?: {
    actionType?: string;
    initiatingSurface?: string;
  }
): Promise<string | null> {
  const userId = await uid();
  if (!userId) return null;

  const payload: Record<string, unknown> = {
      id: record.id,
      user_id: userId,
      workflow_id: record.workflowId,
      domain: record.domain,
      action_type: opts?.actionType ?? null,
      current_state: record.currentState,
      state_history: record.stateHistory,
      assigned_advisor: record.assignedAdvisor,
      entity_scope: record.entityScope as unknown as Record<string, unknown>,
      rollback_eligible: record.rollbackEligible,
      replayable: record.replayable,
      blocking_reasons: record.blockingReasons,
      depends_on: record.dependsOn,
      confidence_score: record.confidenceScore,
      proof_ids: record.proofIds,
      initiating_surface: opts?.initiatingSurface ?? null,
  };

  const { data, error } = await fromDynamicTable("os_action_lineage")
    .insert(payload)
    .select("id")
    .single();

  if (error) { console.error("[action-persistence] insert failed:", error); return null; }
  return data?.id ?? null;
}

// ── Update action state (transition) ────────────────────────────

export async function persistActionTransition(
  actionId: string,
  newState: ActionState,
  transition: ActionStateTransition,
  opts?: {
    rollbackEligible?: boolean;
    confidenceScore?: number;
    blockingReasons?: string[];
    stuckSince?: string | null;
  }
): Promise<boolean> {
  // Fetch current to append to state_history
  const { data: current } = await fromDynamicTable("os_action_lineage")
    .select("state_history")
    .eq("id", actionId)
    .maybeSingle();

  if (!current) return false;

  const history = [...((current.state_history as unknown[]) ?? []), transition];

  const updatePayload: Record<string, unknown> = {
    current_state: newState,
    state_history: history,
  };

  if (opts?.rollbackEligible !== undefined) updatePayload.rollback_eligible = opts.rollbackEligible;
  if (opts?.confidenceScore !== undefined) updatePayload.confidence_score = opts.confidenceScore;
  if (opts?.blockingReasons) updatePayload.blocking_reasons = opts.blockingReasons;
  if (opts?.stuckSince !== undefined) updatePayload.stuck_since = opts.stuckSince;

  const { error } = await fromDynamicTable("os_action_lineage")
    .update(updatePayload as never)
    .eq("id", actionId);

  if (error) { console.error("[action-persistence] transition update failed:", error); return false; }
  return true;
}

// ── Link references ─────────────────────────────────────────────

export async function linkEventToAction(actionId: string, eventId: string): Promise<boolean> {
  const { data } = await fromDynamicTable("os_action_lineage")
    .select("linked_event_ids")
    .eq("id", actionId)
    .maybeSingle();
  if (!data) return false;

  const ids = [...new Set([...(data.linked_event_ids ?? []), eventId])];
  const { error } = await fromDynamicTable("os_action_lineage")
    .update({ linked_event_ids: ids })
    .eq("id", actionId);

  return !error;
}

export async function linkMemoryToAction(actionId: string, memoryId: string): Promise<boolean> {
  const { data } = await fromDynamicTable("os_action_lineage")
    .select("linked_memory_ids")
    .eq("id", actionId)
    .maybeSingle();
  if (!data) return false;

  const ids = [...new Set([...(data.linked_memory_ids ?? []), memoryId])];
  const { error } = await fromDynamicTable("os_action_lineage")
    .update({ linked_memory_ids: ids })
    .eq("id", actionId);

  return !error;
}

export async function linkPolicyToAction(actionId: string, policyEvalId: string): Promise<boolean> {
  const { data } = await fromDynamicTable("os_action_lineage")
    .select("linked_policy_ids")
    .eq("id", actionId)
    .maybeSingle();
  if (!data) return false;

  const ids = [...new Set([...(data.linked_policy_ids ?? []), policyEvalId])];
  const { error } = await fromDynamicTable("os_action_lineage")
    .update({ linked_policy_ids: ids })
    .eq("id", actionId);

  return !error;
}

export async function linkReceiptToAction(actionId: string, receiptId: string): Promise<boolean> {
  const { data } = await fromDynamicTable("os_action_lineage")
    .select("linked_receipt_ids")
    .eq("id", actionId)
    .maybeSingle();
  if (!data) return false;

  const ids = [...new Set([...(data.linked_receipt_ids ?? []), receiptId])];
  const { error } = await fromDynamicTable("os_action_lineage")
    .update({ linked_receipt_ids: ids })
    .eq("id", actionId);

  return !error;
}

export async function addProofToAction(actionId: string, proofId: string): Promise<boolean> {
  const { data } = await fromDynamicTable("os_action_lineage")
    .select("proof_ids")
    .eq("id", actionId)
    .maybeSingle();
  if (!data) return false;

  const ids = [...new Set([...(data.proof_ids ?? []), proofId])];
  const { error } = await fromDynamicTable("os_action_lineage")
    .update({ proof_ids: ids })
    .eq("id", actionId);

  return !error;
}

// ── Fetch actions ───────────────────────────────────────────────

export async function fetchActionLineage(filters?: {
  domain?: string;
  currentState?: ActionState;
  workflowId?: string;
  includeArchived?: boolean;
  limit?: number;
}): Promise<PersistedActionLineage[]> {
  const userId = await uid();
  if (!userId) return [];

  let query = fromDynamicTable("os_action_lineage")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.currentState) query = query.eq("current_state", filters.currentState);
  if (filters?.workflowId) query = query.eq("workflow_id", filters.workflowId);
  if (!filters?.includeArchived) query = query.not("current_state", "in", "(verified,archived)");
  query = query.limit(filters?.limit ?? 200);

  const { data, error } = await query;
  if (error) { console.error("[action-persistence] fetch failed:", error); return []; }
  return (data ?? []) as unknown as PersistedActionLineage[];
}

// ── Get full action explanation ──────────────────────────────────

export async function getActionExplanation(actionId: string): Promise<{
  action: PersistedActionLineage | null;
  events: any[];
  policies: any[];
  receipts: any[];
}> {
  const { data: action } = await fromDynamicTable("os_action_lineage")
    .select("*")
    .eq("id", actionId)
    .maybeSingle();

  if (!action) return { action: null, events: [], policies: [], receipts: [] };

  // Fetch linked entities in parallel
  const [events, policies, receipts] = await Promise.all([
    action.linked_event_ids?.length > 0
      ? fromDynamicTable("os_event_log").select("*").in("id", action.linked_event_ids).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
    action.linked_policy_ids?.length > 0
      ? fromDynamicTable("os_policy_evaluations").select("*").in("id", action.linked_policy_ids).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
    action.linked_receipt_ids?.length > 0
      ? fromDynamicTable("sita_receipts").select("*").in("id", action.linked_receipt_ids).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
  ]);

  return { action: action as unknown as PersistedActionLineage, events, policies, receipts };
}

// ── Detect stuck actions ────────────────────────────────────────

export async function findStuckActions(thresholdMs = 30 * 60 * 1000): Promise<PersistedActionLineage[]> {
  const all = await fetchActionLineage({ includeArchived: false, limit: 500 });
  const threshold = new Date(Date.now() - thresholdMs).toISOString();

  return all.filter(a => a.updated_at < threshold);
}
