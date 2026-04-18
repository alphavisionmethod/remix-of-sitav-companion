// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance Capability Handlers
// Registered with the kernel's capability router for canonical execution
// ═══════════════════════════════════════════════════════════════

import { registerCapability } from "./capability-registry";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

async function getUid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ── Invoice Operations ──────────────────────────────────────────

registerCapability("finance.invoice.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("invoices")
    .insert({ ...params, user_id: uid })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("finance.invoice.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("invoices")
    .update(updates)
    .eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

registerCapability("finance.invoice.delete", async (params) => {
  const { error } = await fromDynamicTable("invoices")
    .delete()
    .eq("id", params.id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Bill Operations ─────────────────────────────────────────────

registerCapability("finance.bill.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("bills")
    .insert({ ...params, user_id: uid })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("finance.bill.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("bills")
    .update(updates)
    .eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Payment Operations ──────────────────────────────────────────

registerCapability("finance.payment.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("payments")
    .insert({ ...params, user_id: uid })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Budget Operations ───────────────────────────────────────────

registerCapability("finance.budget.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("budgets")
    .insert({ ...params, user_id: uid })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("finance.budget.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("budgets")
    .update(updates)
    .eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});

// ── Capital Allocation Operations ───────────────────────────────

registerCapability("finance.allocation.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("capital_allocations")
    .insert({ ...params, user_id: uid })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

// ── Subscription Operations ─────────────────────────────────────

registerCapability("finance.subscription.create", async (params) => {
  const uid = await getUid();
  const { data, error } = await fromDynamicTable("subscriptions")
    .insert({ ...params, user_id: uid })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
});

registerCapability("finance.subscription.update", async (params) => {
  const { id, ...updates } = params;
  const { error } = await fromDynamicTable("subscriptions")
    .update(updates)
    .eq("id", id as string);
  if (error) return { success: false, error: error.message };
  return { success: true };
});
