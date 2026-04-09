// ═══════════════════════════════════════════════════════════════
// SITA OS — System Capability Handlers
// Devices, notifications, preferences, kill-switches, connectors
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

async function getUid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ── Device Registration ─────────────────────────────────────────

registerCapability("system.device.register", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("devices")
    .upsert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("system.device.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("devices")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Notification Operations ─────────────────────────────────────

registerCapability("system.notification.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("notifications_queue")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("system.notification.dismiss", async (params) => {
  const { error } = await fromDynamicTable("notifications_queue")
    .update({ read_at: new Date().toISOString() })
    .eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Kill Switch Operations ──────────────────────────────────────

registerCapability("system.kill-switch.toggle", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("automation_kill_switches")
    .upsert({ user_id: uid, scope: params.scope, enabled: params.enabled })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Connector Operations ────────────────────────────────────────

registerCapability("system.connector.configure", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("connector_configs")
    .upsert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("system.connector.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("connector_configs")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Preference Operations ───────────────────────────────────────

registerCapability("system.preference.set", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("user_preferences")
    .upsert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Setup Session Operations ────────────────────────────────────

registerCapability("system.setup.upsert", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("setup_sessions")
    .upsert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Proof Record Operations ─────────────────────────────────────

registerCapability("system.proof.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("proof_records")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Policy CRUD (system-domain) ─────────────────────────────────

registerCapability("system.policy.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("policies")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("system.policy.toggle", async (params) => {
  const { id, active } = params;
  const { error } = await fromDynamicTable("policies")
    .update({ active }).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("system.policy.delete", async (params) => {
  const { error } = await fromDynamicTable("policies")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Inbox Capture ───────────────────────────────────────────────

registerCapability("system.inbox.capture", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("events")
    .insert({ ...params, user_id: uid, type: "inbox.capture", source: "quick-capture" })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Connector Connect/Disconnect (via edge function) ────────────

registerCapability("system.connector.connect", async (params) => {
  const { data, error } = await supabase.functions.invoke("connector-oauth", {
    body: { action: "initiate", connector_id: params.connectorId },
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("system.connector.disconnect", async (params) => {
  const { data, error } = await supabase.functions.invoke("connector-oauth", {
    body: { action: "disconnect", account_id: params.accountId },
  });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Memory Operations ───────────────────────────────────────────

registerCapability("system.memory.forget", async (params) => {
  const { error } = await fromDynamicTable("user_memory")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("system.memory.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("user_memory")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Notification Preferences ────────────────────────────────────

registerCapability("system.notification-pref.upsert", async (params) => {
  const uid = await getUid();
  const { error } = await fromDynamicTable("notification_preferences")
    .upsert({ ...params, user_id: uid }, { onConflict: "user_id,category" });
  if (error) return { success: false, error: error.message };
  return { success: true };
});
