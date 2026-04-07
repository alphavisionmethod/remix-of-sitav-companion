// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Capability Handlers
// Policies, operator actions, audit logs, governance
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

async function getUid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ── Policy Operations ───────────────────────────────────────────

registerCapability("admin.policy.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("policies")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("admin.policy.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("policies")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("admin.policy.delete", async (params) => {
  const { error } = await fromDynamicTable("policies")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Operator Action Logging ─────────────────────────────────────

registerCapability("admin.operator-action.log", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("operator_actions")
    .insert({
      user_id: uid,
      action_type: params.action_type,
      target_table: params.target_table,
      target_id: params.target_id,
      payload: params.payload || {},
      result: params.result || {},
    })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Approval Queue Operations ───────────────────────────────────

registerCapability("admin.approval.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("approval_queue")
    .insert({ ...params, user_id: uid, status: "pending" })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("admin.approval.decide", async (params) => {
  const { id, status, decided_by, ...rest } = params;
  const { error } = await fromDynamicTable("approval_queue")
    .update({ status, decided_by, decided_at: new Date().toISOString(), ...rest })
    .eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Audit Log Operations ────────────────────────────────────────

registerCapability("admin.audit.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("audit_logs")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Constitution Rule Operations ────────────────────────────────

registerCapability("admin.constitution.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("constitution_rules")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("admin.constitution.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("constitution_rules")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Policy Version Operations ───────────────────────────────────

registerCapability("admin.policy-version.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("policy_versions")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── AI Budget Policy Operations ─────────────────────────────────

registerCapability("admin.ai-budget.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("ai_budget_policies")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("admin.ai-budget.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("ai_budget_policies")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});
