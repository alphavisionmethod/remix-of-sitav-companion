// ═══════════════════════════════════════════════════════════════
// SITA OS — System Misc Data Service
// CRUD operations for 36 miscellaneous orphaned tables
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
  if (error) { console.error(`[system-misc] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[system-misc] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[system-misc] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromTable(table).delete().eq("id", id);
  if (error) { console.error(`[system-misc] ${table} delete:`, error); return false; }
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

export const boardroomDecisions = crud("boardroom_decisions");
export const brandKits = crud("brand_kits");
export const catalystEvents = crud("catalyst_events");
export const changePlans = crud("change_plans");
export const chiefDigitalSynthesis = crud("chief_digital_synthesis");
export const contentFreshness = crud("content_freshness");
export const crossTenantPatternLearning = crud("cross_tenant_pattern_learning_records");
export const deliveryTemplates = crud("delivery_templates");
export const deviceAuthClients = crud("device_auth_clients");
export const differentialReasoningRecords = crud("differential_reasoning_records");
export const domainMethodologyPacks = crud("domain_methodology_packs");
export const e2eSteps = crud("e2e_steps");
export const encryptedSecrets = crud("encrypted_secrets");
export const mediaItems = crud("media_items");
export const outcomeEconomicsRecords = crud("outcome_economics_records");
export const packetCompilationRecords = crud("packet_compilation_records");
export const patchExecutions = crud("patch_executions");
export const playbookMetrics = crud("playbook_metrics");
export const presenceReceipts = crud("presence_receipts");
export const presenceTimelineEvents = crud("presence_timeline_events");
export const reasoningEscalationRecords = crud("reasoning_escalation_records");
export const reasoningPathPerformance = crud("reasoning_path_performance_records");
export const sideEffectPolicies = crud("side_effect_policies");
export const siteIssues = crud("site_issues");
export const siteOpportunities = crud("site_opportunities");
export const siteRegistry = crud("site_registry");
export const sitaMemoryEntries = crud("sita_memory_entries");
export const sovereignExports = crud("sovereign_exports");
export const strategyDnaProfiles = crud("strategy_dna_profiles");
export const systemConfig = crud("system_config");
export const tenantFirewallLogs = crud("tenant_firewall_logs");
export const timeMachineSnapshots = crud("time_machine_snapshots");
export const zeroWastePromptProfiles = crud("zero_waste_prompt_profiles");
export const computeBudgetSnapshots = crud("compute_budget_snapshots");
export const operatorTasteProfiles = crud("operator_taste_profiles");
export const qualityFloorConfigs = crud("quality_floor_configs");
