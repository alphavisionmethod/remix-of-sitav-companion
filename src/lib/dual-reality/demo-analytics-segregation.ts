// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Analytics Segregation
// Labels all demo events, prevents analytics contamination
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "./reality-mode-registry";

export interface DemoAnalyticsEvent {
  eventName: string;
  route?: string;
  mode: RealityModeKey;
  scenarioId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event with proper mode segregation.
 * Demo events go to demo_analytics; real events go to normal analytics.
 */
export async function trackModeAwareEvent(event: DemoAnalyticsEvent): Promise<void> {
  if (event.mode === "real") {
    // Real events go to normal analytics pipeline (no-op here, handled elsewhere)
    return;
  }

  // Demo/sandbox events go to segregated table
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await fromTable("demo_analytics").insert({
    user_id: user.id,
    scenario_id: event.scenarioId,
    event_name: event.eventName,
    route: event.route ?? window.location.pathname,
    mode: event.mode,
    session_id: sessionStorage.getItem("sita-session-id") ?? undefined,
    metadata: event.metadata ?? {},
  });
}

/**
 * Record a demo action with its execution semantics
 */
export async function recordDemoAction(action: {
  scenarioId?: string;
  featureId?: string;
  actionType: string;
  route?: string;
  executionMode: "simulated" | "preview_only" | "blocked" | "safe_internal_write" | "other";
  outcomeSummary?: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await fromTable("demo_actions").insert({
    user_id: user.id,
    scenario_id: action.scenarioId,
    feature_id: action.featureId,
    action_type: action.actionType,
    actor_id: user.id,
    route: action.route ?? window.location.pathname,
    execution_mode: action.executionMode,
    outcome_summary: action.outcomeSummary,
  });
}

/**
 * Create a demo receipt for a simulated action
 */
export async function createDemoReceipt(receipt: {
  scenarioId?: string;
  featureId?: string;
  receiptType: string;
  summary: string;
  visibleToRoles?: string[];
}): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await fromTable("demo_receipts").insert({
    user_id: user.id,
    scenario_id: receipt.scenarioId,
    feature_id: receipt.featureId,
    receipt_type: receipt.receiptType,
    actor_id: user.id,
    summary: receipt.summary,
    simulated: true,
    visible_to_roles: receipt.visibleToRoles ?? [],
  }).select("id").single();

  if (error) { console.error("[demo-analytics] receipt insert failed:", error); return null; }
  return data?.id ?? null;
}
