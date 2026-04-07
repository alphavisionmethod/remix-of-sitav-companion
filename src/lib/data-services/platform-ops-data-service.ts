// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Ops Data Service
// CRUD operations for 23 platform_* tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QF = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QF & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let q = fromTable(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) q = q.gte("created_at", filters.since);
  q = q.limit(filters?.limit ?? 100);
  const { data, error } = await q;
  if (error) { console.error(`[platform-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[platform-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[platform-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromTable(table).delete().eq("id", id);
  if (error) { console.error(`[platform-ops] ${table} delete:`, error); return false; }
  return true;
}

function crud(table: string) {
  return {
    list: (f?: QF) => queryTable(table, f),
    create: (row: Record<string, unknown>) => insertRow(table, row),
    update: (id: string, u: Record<string, unknown>) => updateRow(table, id, u),
    delete: (id: string) => deleteRow(table, id),
  };
}

export const platformDurabilityStates = crud("platform_admin_durability_states");
export const platformMutations = crud("platform_admin_mutations");
export const platformConcierge = crud("platform_concierge_continuity");
export const platformConnectorHealth = crud("platform_connector_health");
export const platformConnectorLifecycle = crud("platform_connector_lifecycle");
export const platformDegradedStates = crud("platform_degraded_states");
export const platformDeploymentGates = crud("platform_deployment_gates");
export const platformDocsRuntimeDrift = crud("platform_docs_runtime_drift");
export const platformEnvironmentTruth = crud("platform_environment_truth");
export const platformLaunchBlockers = crud("platform_launch_blockers");
export const platformLaunchGates = crud("platform_launch_gates");
export const platformMutationReceipts = crud("platform_mutation_receipts");
export const platformOperatorIncidents = crud("platform_operator_incidents");
export const platformProjectionStates = crud("platform_projection_states");
export const platformPromotionReadiness = crud("platform_promotion_readiness");
export const platformProofCoverage = crud("platform_proof_coverage");
export const platformReadModelHealth = crud("platform_read_model_health");
export const platformRollbackVerifications = crud("platform_rollback_verifications");
export const platformRunbookExecutions = crud("platform_runbook_executions");
export const platformSecurityPosture = crud("platform_security_posture");
export const platformTruthManifests = crud("platform_truth_manifests");
export const platformTruthSyncLog = crud("platform_truth_sync_log");
export const platformValidationScores = crud("platform_validation_scores");
export const platformScenarios = crud("scenarios");
