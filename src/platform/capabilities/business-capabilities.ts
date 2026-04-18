// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Capability Handlers
// CRM, contacts, leads, opportunities, customers
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

async function getUid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ── Contact Operations ──────────────────────────────────────────

registerCapability("business.contact.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("contacts")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("business.contact.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("contacts")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("business.contact.delete", async (params) => {
  const { error } = await fromDynamicTable("contacts")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Lead Operations ─────────────────────────────────────────────

registerCapability("business.lead.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("leads")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("business.lead.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("leads")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Opportunity Operations ──────────────────────────────────────

registerCapability("business.opportunity.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("opportunities")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("business.opportunity.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("opportunities")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Customer Operations ─────────────────────────────────────────

registerCapability("business.customer.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("customers")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("business.customer.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("customers")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Quote/Proposal Operations ───────────────────────────────────

registerCapability("business.quote.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("quotes")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("business.quote.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("quotes")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Opportunity Stage Update ────────────────────────────────────

registerCapability("business.opportunity.update-stage", async (params) => {
  const { id, stage } = params;
  const { error } = await fromDynamicTable("opportunities")
    .update({ stage, last_movement_at: new Date().toISOString() }).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("business.opportunity.delete", async (params) => {
  const { error } = await fromDynamicTable("opportunities")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Quote Status Update & Delete ────────────────────────────────

registerCapability("business.status.update", async (params) => {
  const { id, table, ...updates } = params;
  const targetTable = (table as string) || "quotes";
  const { error } = await fromDynamicTable(targetTable)
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("business.quote.delete", async (params) => {
  const { error } = await fromDynamicTable("quotes")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});
