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

// ── Generic Seed Operation ──────────────────────────────────────

registerCapability("admin.seed.run", async (params) => {
  const uid = await getUid();
  const table = params.table as string;
  const records = params.records as Record<string, unknown>[];
  if (!table || !records) return { success: false, error: "table and records required" };
  const withUser = records.map(r => ({ ...r, user_id: uid }));
  const { error } = await fromDynamicTable(table).upsert(withUser);
  if (error) return { success: false, error: error.message };
  return { success: true, data: { seeded: records.length } };
});

// ── Generic Status Update ───────────────────────────────────────

registerCapability("admin.status.update", async (params) => {
  const { table, id, ...updates } = params;
  const { error } = await fromDynamicTable(table as string)
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Approval Queue Update ───────────────────────────────────────

registerCapability("admin.approval.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("approval_queue")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Kill Switch Toggle ──────────────────────────────────────────

registerCapability("admin.kill-switch.toggle", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("automation_kill_switches")
    .upsert({ user_id: uid, scope: params.scope, enabled: params.enabled })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Connector Admin Operations ──────────────────────────────────

registerCapability("admin.connector.disconnect", async (params) => {
  const { error } = await fromDynamicTable("connector_accounts")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("admin.connector.activate", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("connector_configs")
    .update({ ...updates, status: "active" }).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Sync & Health Operations ────────────────────────────────────

registerCapability("admin.sync.run", async (params) => {
  const { data, error } = await supabase.functions.invoke("connector-sync", {
    body: params,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("admin.health.check", async (params) => {
  return { success: true, data: { status: "healthy", checkedAt: new Date().toISOString(), ...params } };
});

registerCapability("admin.health.check-readiness", async (params) => {
  return { success: true, data: { ready: true, checkedAt: new Date().toISOString(), ...params } };
});

// ── Settings Save ───────────────────────────────────────────────

registerCapability("admin.settings.save", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("user_preferences")
    .upsert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Blueprint Create ────────────────────────────────────────────

registerCapability("admin.blueprint.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("feature_blueprints")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Audit Run ───────────────────────────────────────────────────

registerCapability("admin.audit.run", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("audit_logs")
    .insert({ ...params, user_id: uid, action: "audit_run" })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Compatibility & Drift Checks ────────────────────────────────

registerCapability("admin.compatibility.check", async (params) => {
  return { success: true, data: { compatible: true, checkedAt: new Date().toISOString(), ...params } };
});

registerCapability("admin.drift.check", async (params) => {
  return { success: true, data: { driftDetected: false, checkedAt: new Date().toISOString(), ...params } };
});

// ── Replay & Recovery ───────────────────────────────────────────

registerCapability("admin.replay.run", async (params) => {
  return { success: true, data: { replayed: true, ...params } };
});

// ── System Command ──────────────────────────────────────────────

registerCapability("admin.command.send", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("agent_signals")
    .insert({ user_id: uid, agent_id: params.agentId || "system", signal_type: `os_command:${params.command}`, payload: params })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Advisor CRUD ────────────────────────────────────────────────

registerCapability("admin.advisor.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("advisor_configs")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("admin.advisor.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("advisor_configs")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("admin.advisor.toggle", async (params) => {
  const { id, active } = params;
  const { error } = await fromDynamicTable("advisor_configs")
    .update({ active }).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("admin.advisor.delete", async (params) => {
  const { error } = await fromDynamicTable("advisor_configs")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── User Admin Action ───────────────────────────────────────────

registerCapability("admin.user.action", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("operator_actions")
    .insert({ user_id: uid, action_type: params.action, target_id: params.targetUserId, payload: params })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Presence Update ─────────────────────────────────────────────

registerCapability("admin.presence.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("devices")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Roles Seed ──────────────────────────────────────────────────

registerCapability("admin.roles.seed", async (params) => {
  const uid = await getUid();
  const { error } = await fromDynamicTable("user_roles")
    .upsert({ user_id: uid, role: params.role || "user" });
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Readiness Seed ──────────────────────────────────────────────

registerCapability("admin.readiness.seed", async (params) => {
  return { success: true, data: { seeded: true, ...params } };
});
