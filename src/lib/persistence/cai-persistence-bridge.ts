// ═══════════════════════════════════════════════════════════════
// SITA OS — CAI Persistence Bridge
// Connects in-memory OS services → 23 dedicated CAI DB tables
// Called by SitaOSContext after mutations for durable audit trail
// ═══════════════════════════════════════════════════════════════

import * as cai from "@/lib/data-services/cai-data-service";

// ── Debounce helper (fire-and-forget, non-blocking) ─────────────
const pending = new Map<string, ReturnType<typeof setTimeout>>();
function debounced(key: string, ms: number, fn: () => Promise<unknown>) {
  const existing = pending.get(key);
  if (existing) clearTimeout(existing);
  pending.set(key, setTimeout(() => { fn().catch(e => console.warn(`[cai-bridge] ${key}:`, e)); pending.delete(key); }, ms));
}

// ── Graph persistence ───────────────────────────────────────────

export function persistGraphNode(node: {
  node_type: string; node_ref: string; label: string; state?: string;
  visibility_scope?: string; metadata?: Record<string, unknown>;
}) {
  return cai.graphNodes.create(node);
}

export function persistGraphEdge(edge: {
  from_node_id: string; to_node_id: string; edge_type: string;
  weight?: number; visibility_scope?: string; metadata?: Record<string, unknown>;
}) {
  return cai.graphEdges.create(edge);
}

// ── Intent persistence ──────────────────────────────────────────

export function persistIntentResolution(intent: {
  source_surface: string; source_device_id?: string; raw_input: string;
  resolved_intent: string; confidence: number; target_capability: string;
  status: string;
}) {
  return cai.intents.create(intent);
}

// ── Command orchestration ───────────────────────────────────────

export function persistCommandOrchestration(cmd: {
  intent_resolution_id?: string; capability_key: string;
  workflow_ref?: string; policy_decision_ref?: string;
  trust_decision_ref?: string; execution_state: string; receipt_id?: string;
}) {
  return cai.commands.create(cmd);
}

// ── Priority stack snapshot ─────────────────────────────────────

export function persistPrioritySnapshot(snapshot: {
  mode: string; stack_date: string; top_items_json: unknown;
  urgency_summary: string; attention_posture: string;
}) {
  debounced("priority-snapshot", 5000, () => cai.priorities.create(snapshot));
}

// ── Attention decision ──────────────────────────────────────────

export function persistAttentionDecision(decision: {
  event_ref: string; urgency_class: string; routing_decision: string;
  selected_surface?: string; selected_device_id?: string;
  deferred?: boolean; defer_until?: string; reason: string; fatigue_score?: number;
}) {
  return cai.attentionDecisions.create(decision);
}

// ── Continuity session ──────────────────────────────────────────

export function persistContinuitySession(session: {
  source_surface: string; target_surface: string;
  source_device_id?: string; target_device_id?: string;
  context_ref?: string; status: string;
}) {
  return cai.continuitySessions.create(session);
}

// ── Handoff context ─────────────────────────────────────────────

export function persistHandoffContext(handoff: {
  continuity_session_id?: string; context_type: string;
  payload_ref?: string; urgency_class?: string; resumable?: boolean;
}) {
  return cai.handoffs.create(handoff);
}

// ── Trust-weighted action ───────────────────────────────────────

export function persistTrustAction(action: {
  action_type: string; action_ref: string; risk_tier: string;
  trust_class: string; device_trust_class?: string; mode: string;
  routing: string; reason: string;
}) {
  return cai.trustActions.create(action);
}

// ── Action escalation ───────────────────────────────────────────

export function persistActionEscalation(escalation: {
  trust_weighted_action_id?: string; from_state: string; to_state: string;
  escalation_reason: string; target_surface?: string; target_device_id?: string;
}) {
  return cai.escalations.create(escalation);
}

// ── Assistant role state ────────────────────────────────────────

export function persistAssistantRoleState(role: {
  role_key: string; state: string; posture?: string; confidence?: number;
}) {
  return cai.assistantRoles.create(role);
}

// ── Coordinated assistant session ───────────────────────────────

export function persistAssistantSession(session: {
  active_roles: string[]; current_objective?: string;
  current_context_ref?: string; support_intensity?: string; calmness_profile?: string;
}) {
  return cai.assistantSessions.create(session);
}

// ── Timing intelligence decision ────────────────────────────────

export function persistTimingDecision(decision: {
  trigger_ref: string; recommendation: string; reason: string;
  readiness_ref?: string;
}) {
  return cai.timingDecisions.create(decision);
}

// ── Relationship context ────────────────────────────────────────

export function persistRelationshipContext(ctx: {
  related_person_ref: string; relationship_type: string;
  importance_tier: string; last_interaction_at?: string;
  open_loops_json?: unknown; obligations_json?: unknown; visibility_scope?: string;
}) {
  return cai.relationships.create(ctx);
}

// ── Human obligation ────────────────────────────────────────────

export function persistHumanObligation(obligation: {
  related_person_ref: string; obligation_type: string;
  due_at?: string; status: string; source_ref?: string;
}) {
  return cai.obligations.create(obligation);
}

// ── Digest compilation ──────────────────────────────────────────

export function persistDigestCompilation(digest: {
  digest_type: string; mode: string; source_refs?: string[];
  delivery_surface?: string; summary_ref?: string;
}) {
  return cai.digests.create({ ...digest, generated_at: new Date().toISOString() });
}

// ── Operating mode ──────────────────────────────────────────────

export function persistOperatingMode(mode: {
  mode_key: string; active: boolean; metadata?: Record<string, unknown>;
}) {
  return cai.operatingModes.create({
    ...mode,
    started_at: new Date().toISOString(),
  });
}

// ── Adaptive interface profile ──────────────────────────────────

export function persistAdaptiveProfile(profile: {
  surface: string; current_mode: string; cognitive_load_class: string;
  density_preference: string; summary_depth: string; quick_action_bias: string;
}) {
  debounced("adaptive-profile", 3000, () => cai.interfaceProfiles.create(profile));
}

// ── Opportunity signal ──────────────────────────────────────────

export function persistOpportunitySignal(signal: {
  domain: string; signal_type: string; title: string; summary: string;
  importance_tier: string; confidence: number; source_refs?: string[];
  status: string;
}) {
  return cai.opportunitySignals.create(signal);
}

// ── Memory governance ───────────────────────────────────────────

export function persistMemoryGovernanceRecord(record: {
  memory_ref: string; confidence: number; freshness: number;
  correction_state: string; archival_state: string; visibility_scope: string;
}) {
  return cai.memoryGovernance.create(record);
}

// ── Memory correction ───────────────────────────────────────────

export function persistMemoryCorrection(correction: {
  memory_ref: string; correction_type: string;
  old_value_ref?: string; new_value_ref?: string; reason: string;
}) {
  return cai.memoryCorrections.create(correction);
}

// ── Boundary policy ─────────────────────────────────────────────

export function persistBoundaryPolicy(policy: {
  boundary_type: string; policy_json: unknown; active: boolean;
}) {
  return cai.boundaryPolicies.create(policy);
}

// ── Experience signature rule ───────────────────────────────────

export function persistExperienceRule(rule: {
  surface: string; context_type: string; urgency_class: string;
  tone_profile: string; summary_style: string; proof_style: string;
  escalation_style: string; active: boolean;
}) {
  return cai.experienceRules.create(rule);
}

// ── Batch query helpers for CAI pages ───────────────────────────

export const caiQueries = {
  graphNodes: cai.graphNodes.list,
  graphEdges: cai.graphEdges.list,
  intents: cai.intents.list,
  commands: cai.commands.list,
  priorities: cai.priorities.list,
  attentionDecisions: cai.attentionDecisions.list,
  continuitySessions: cai.continuitySessions.list,
  handoffs: cai.handoffs.list,
  trustActions: cai.trustActions.list,
  escalations: cai.escalations.list,
  assistantRoles: cai.assistantRoles.list,
  assistantSessions: cai.assistantSessions.list,
  timingDecisions: cai.timingDecisions.list,
  relationships: cai.relationships.list,
  obligations: cai.obligations.list,
  digests: cai.digests.list,
  operatingModes: cai.operatingModes.list,
  interfaceProfiles: cai.interfaceProfiles.list,
  opportunitySignals: cai.opportunitySignals.list,
  memoryGovernance: cai.memoryGovernance.list,
  memoryCorrections: cai.memoryCorrections.list,
  boundaryPolicies: cai.boundaryPolicies.list,
  experienceRules: cai.experienceRules.list,
};
