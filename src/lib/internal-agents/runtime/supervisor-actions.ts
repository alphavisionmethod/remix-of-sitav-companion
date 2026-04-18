// ═══════════════════════════════════════════════════════════════
// SITA OS — Supervisor Runtime Action Helpers (Phase 5)
//
// Server-side authoritative supervisor decisions. Each helper
// writes to supervisor_decisions and mutates target state in one
// transaction-like sequence. Admin-permission-gated by RLS.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type SupervisorDecisionType =
  | "approve" | "reject" | "override"
  | "suspend" | "resume" | "downgrade" | "upgrade"
  | "escalate_meta" | "dismiss";

export interface SupervisorActionInput {
  supervisorKey: string;
  decisionType: SupervisorDecisionType;
  targetAgentId?: string | null;
  targetActionId?: string | null;
  targetEscalationId?: string | null;
  rationale: string;
  evidenceRefs?: unknown[];
  correlationId?: string;
}

async function recordDecision(input: SupervisorActionInput, previousState?: unknown, newState?: unknown) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("supervisor_decisions")
    .insert({
      supervisor_key: input.supervisorKey,
      decision_type: input.decisionType,
      target_agent_id: input.targetAgentId ?? null,
      target_action_id: input.targetActionId ?? null,
      target_escalation_id: input.targetEscalationId ?? null,
      rationale: input.rationale,
      evidence_refs: (input.evidenceRefs ?? []) as never,
      previous_state: (previousState ?? null) as never,
      new_state: (newState ?? null) as never,
      decided_by: user?.id ?? null,
      correlation_id: input.correlationId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// ── Suspend agent — sets current_status='suspended' ────────────
export async function suspendAgent(input: SupervisorActionInput & { targetAgentId: string }) {
  if (!input.rationale || input.rationale.length < 10) {
    throw new Error("Suspension requires rationale (min 10 chars)");
  }
  const { data: prev } = await supabase
    .from("internal_agent_runtime_state").select("*").eq("agent_id", input.targetAgentId).maybeSingle();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: next, error } = await supabase
    .from("internal_agent_runtime_state")
    .update({
      current_status: "suspended",
      suspended_at: new Date().toISOString(),
      suspended_by: user?.id ?? null,
      suspension_reason: input.rationale,
    })
    .eq("agent_id", input.targetAgentId)
    .select("*").single();
  if (error) throw error;

  return recordDecision({ ...input, decisionType: "suspend" }, prev, next);
}

// ── Resume agent ───────────────────────────────────────────────
export async function resumeAgent(input: SupervisorActionInput & { targetAgentId: string }) {
  const { data: prev } = await supabase
    .from("internal_agent_runtime_state").select("*").eq("agent_id", input.targetAgentId).maybeSingle();

  const { data: next, error } = await supabase
    .from("internal_agent_runtime_state")
    .update({
      current_status: "idle",
      suspended_at: null,
      suspended_by: null,
      suspension_reason: null,
      cooldown_until: null,
      consecutive_failures: 0,
    })
    .eq("agent_id", input.targetAgentId)
    .select("*").single();
  if (error) throw error;

  return recordDecision({ ...input, decisionType: "resume" }, prev, next);
}

// ── Downgrade autonomy ─────────────────────────────────────────
const AUTONOMY_ORDER = [
  "observe", "diagnose", "recommend", "draft",
  "simulate", "approval_ready", "constrained_action_ready",
];
export async function downgradeAutonomy(input: SupervisorActionInput & { targetAgentId: string }) {
  const { data: def } = await supabase
    .from("internal_agent_definitions").select("*").eq("agent_id", input.targetAgentId).maybeSingle();
  if (!def) throw new Error(`Agent ${input.targetAgentId} not found`);

  const currentIdx = AUTONOMY_ORDER.indexOf(def.current_autonomy_level);
  const nextLevel = currentIdx > 0 ? AUTONOMY_ORDER[currentIdx - 1] : "observe";

  const { data: next, error } = await supabase
    .from("internal_agent_definitions")
    .update({ current_autonomy_level: nextLevel })
    .eq("agent_id", input.targetAgentId)
    .select("*").single();
  if (error) throw error;

  return recordDecision({ ...input, decisionType: "downgrade" },
    { current_autonomy_level: def.current_autonomy_level },
    { current_autonomy_level: next.current_autonomy_level });
}

// ── Upgrade autonomy (capped at max_autonomy_level) ────────────
export async function upgradeAutonomy(input: SupervisorActionInput & { targetAgentId: string }) {
  const { data: def } = await supabase
    .from("internal_agent_definitions").select("*").eq("agent_id", input.targetAgentId).maybeSingle();
  if (!def) throw new Error(`Agent ${input.targetAgentId} not found`);

  const currentIdx = AUTONOMY_ORDER.indexOf(def.current_autonomy_level);
  const maxIdx = AUTONOMY_ORDER.indexOf(def.max_autonomy_level);
  const nextIdx = Math.min(currentIdx + 1, maxIdx);
  const nextLevel = AUTONOMY_ORDER[nextIdx];

  if (nextLevel === def.current_autonomy_level) {
    throw new Error("Already at max autonomy level for this agent");
  }

  const { data: next, error } = await supabase
    .from("internal_agent_definitions")
    .update({ current_autonomy_level: nextLevel })
    .eq("agent_id", input.targetAgentId)
    .select("*").single();
  if (error) throw error;

  return recordDecision({ ...input, decisionType: "upgrade" },
    { current_autonomy_level: def.current_autonomy_level },
    { current_autonomy_level: next.current_autonomy_level });
}

// ── Resolve escalation (approve / reject / dismiss) ────────────
export async function resolveEscalation(input: SupervisorActionInput & {
  targetEscalationId: string;
  resolution: "approve" | "reject" | "dismiss";
}) {
  const { data: prev } = await supabase
    .from("council_escalations").select("*").eq("id", input.targetEscalationId).maybeSingle();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: next, error } = await supabase
    .from("council_escalations")
    .update({
      status: "resolved",
      resolution_notes: input.rationale,
      resolved_by: user?.id ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", input.targetEscalationId)
    .select("*").single();
  if (error) throw error;

  return recordDecision(
    { ...input, decisionType: input.resolution === "dismiss" ? "dismiss" : input.resolution },
    prev, next,
  );
}

// ── Escalate to meta-supervisor (chief-of-staff) ───────────────
export async function escalateToMeta(input: SupervisorActionInput & { targetEscalationId: string }) {
  const { data: prev } = await supabase
    .from("council_escalations").select("*").eq("id", input.targetEscalationId).maybeSingle();

  const { data: next, error } = await supabase
    .from("council_escalations")
    .update({
      status: "escalated_to_meta",
      target_supervisor: "chief-of-staff",
      meta_escalated_at: new Date().toISOString(),
    })
    .eq("id", input.targetEscalationId)
    .select("*").single();
  if (error) throw error;

  return recordDecision({ ...input, decisionType: "escalate_meta" }, prev, next);
}

// ── Manual trigger an agent (calls internal-agent-loop edge fn) ─
export async function triggerAgentRun(agentId: string) {
  const { data, error } = await supabase.functions.invoke("internal-agent-loop", {
    body: { mode: "manual", agentId },
  });
  if (error) throw error;
  return data;
}
