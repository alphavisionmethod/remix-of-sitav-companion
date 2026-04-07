// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Capability Handlers
// Tasks, bookings, household, calendar, grocery, travel
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

async function getUid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ── Task Operations ─────────────────────────────────────────────

registerCapability("concierge.task.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("tasks")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("concierge.task.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("tasks")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("concierge.task.delete", async (params) => {
  const { error } = await fromDynamicTable("tasks")
    .delete().eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Booking Operations ──────────────────────────────────────────

registerCapability("concierge.booking.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("bookings")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("concierge.booking.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("bookings")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Grocery Operations ──────────────────────────────────────────

registerCapability("concierge.grocery.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("grocery_items")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("concierge.grocery.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("grocery_items")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Household Operations ────────────────────────────────────────

registerCapability("concierge.household.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("household_members")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Calendar Operations ─────────────────────────────────────────

registerCapability("concierge.calendar.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("calendar_events")
    .insert({ ...params, user_id: uid })
    .select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("concierge.calendar.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("calendar_events")
    .update(updates).eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});
