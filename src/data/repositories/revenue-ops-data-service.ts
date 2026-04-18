// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Ops Data Service
// CRUD operations for 17 revenue_* tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QF = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QF & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let q = fromDynamicTable(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) q = q.gte("created_at", filters.since);
  q = q.limit(filters?.limit ?? 100);
  const { data, error } = await q;
  if (error) { console.error(`[revenue-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromDynamicTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[revenue-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromDynamicTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[revenue-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromDynamicTable(table).delete().eq("id", id);
  if (error) { console.error(`[revenue-ops] ${table} delete:`, error); return false; }
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

export const revenueAdvisorStances = crud("revenue_advisor_stances");
export const revenueBookingServices = crud("revenue_booking_services");
export const revenueBookings = crud("revenue_bookings");
export const revenueCampaigns = crud("revenue_campaigns");
export const revenueExperimentVariants = crud("revenue_experiment_variants");
export const revenueExperiments = crud("revenue_experiments");
export const revenueFunnelSteps = crud("revenue_funnel_steps");
export const revenueFunnels = crud("revenue_funnels");
export const revenueJourneyTouchpoints = crud("revenue_journey_touchpoints");
export const revenueMemoryEvents = crud("revenue_memory_events");
export const revenueOfferSales = crud("revenue_offer_sales");
export const revenueOffers = crud("revenue_offers");
export const revenueReputationMetrics = crud("revenue_reputation_metrics");
export const revenueRetentionSignals = crud("revenue_retention_signals");
export const revenueReviews = crud("revenue_reviews");
export const revenueSegments = crud("revenue_segments");
export const revenueWinbackQueue = crud("revenue_winback_queue");
