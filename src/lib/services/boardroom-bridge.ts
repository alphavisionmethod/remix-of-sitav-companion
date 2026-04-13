// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Bridge Service
// Bidirectional communication between domain apps and Boardroom
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export interface EscalationPayload {
  title: string;
  description: string;
  domain: "business" | "finance" | "concierge";
  severity: "low" | "medium" | "high" | "critical";
  advisorSummaries: Record<string, string>;
  escalationReason: string;
  sourceSignals?: any[];
}

export interface DecisionPush {
  receiptId: string;
  approvedMotion: string;
  domain: string;
  summary: string;
  confidence: number;
}

/**
 * Escalate an issue from a domain app into the Boardroom.
 * Writes to boardroom_items with source domain context.
 */
export async function escalateToBoardroom(payload: EscalationPayload): Promise<{ success: boolean; itemId?: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await fromTable("boardroom_items").insert({
    user_id: user.id,
    title: payload.title,
    description: payload.description,
    domain: payload.domain,
    severity: payload.severity,
    status: "new",
    advisor_summaries: payload.advisorSummaries,
    escalation_reason: payload.escalationReason,
    source_signals: payload.sourceSignals || [],
    recommendation_state: "pending",
    simulation_state: "none",
    confidence_state: { overall: 50 },
    freshness_state: { last_check: new Date().toISOString() },
  }).select("id").single();

  if (error) return { success: false, error: error.message };
  return { success: true, itemId: data?.id };
}

/**
 * Push an approved Boardroom decision back to a domain's action queue.
 */
export async function pushDecisionToApp(push: DecisionPush): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await fromTable("advisor_action_queue").insert({
    user_id: user.id,
    action_type: "boardroom_decision",
    advisor_id: "boardroom-system",
    domain: push.domain,
    summary: push.summary,
    confidence: push.confidence,
    status: "proposed",
    requires_approval: false,
    payload: { receipt_id: push.receiptId, approved_motion: push.approvedMotion },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Query pending boardroom items by domain.
 */
export async function getEscalationsByDomain(domain: string): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await fromTable("boardroom_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("domain", domain)
    .in("status", ["new", "active"])
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

/**
 * Query boardroom decisions pushed to a domain.
 */
export async function getDecisionsForDomain(domain: string): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await fromTable("advisor_action_queue")
    .select("*")
    .eq("user_id", user.id)
    .eq("action_type", "boardroom_decision")
    .eq("domain", domain)
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}
