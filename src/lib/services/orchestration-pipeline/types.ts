// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Pipeline: Canonical Packet Types
// Every layer shares these structured contracts
// ═══════════════════════════════════════════════════════════════

export type Domain = "business" | "finance" | "concierge";
export type Severity = "low" | "medium" | "high" | "critical";
export type SignalTrigger = "immediate" | "batched" | "on-demand" | "approval-triggered";

export type IssueLifecycleState =
  | "detected"
  | "advisor_review"
  | "app_board_review"
  | "boardroom_candidate"
  | "boardroom_active"
  | "simulation_pending"
  | "approval_pending"
  | "approved"
  | "deferred"
  | "evidence_requested"
  | "executed"
  | "outcome_tracking"
  | "closed";

// ── Layer A: Domain Signal ──────────────────────────────────────

export interface DomainSignal {
  signal_id: string;
  module: string;
  domain: Domain;
  severity: Severity;
  summary: string;
  triggering_conditions: string[];
  linked_objects: LinkedObject[];
  freshness: string; // ISO timestamp
  confidence: number; // 0-100
  source: string;
  trigger_type: SignalTrigger;
  metadata?: Record<string, unknown>;
}

export interface LinkedObject {
  id: string;
  type: string;
  label: string;
  ref_table?: string;
}

// ── Layer C: Advisor Output Packet ──────────────────────────────

export interface AdvisorOutputPacket {
  packet_id: string;
  advisor_id: string;
  advisor_name: string;
  scope: string;
  domain: Domain;
  target_objects: LinkedObject[];
  signal_ref: string; // signal_id that triggered this
  recommendation: string;
  rationale: string;
  confidence: number; // 0-100
  assumptions: string[];
  risks: string[];
  missing_data: string[];
  escalation_suggestion: string | null;
  boardroom_relevance_score: number; // 0-1
  created_at: string;
}

// ── Layer D: App Board Synthesis ────────────────────────────────

export interface AppBoardSynthesis {
  synthesis_id: string;
  app_id: Domain;
  issue_summary: string;
  affected_modules: string[];
  module_advisor_positions: AdvisorPosition[];
  recommendation: string;
  disagreement_areas: string[];
  trust_state: "verified" | "evidence-backed" | "inferred" | "advisory-only";
  scenario_need: boolean;
  action_options: string[];
  boardroom_candidate_motion: string | null;
  boardroom_worthiness_score: number; // 0-1
  missing_data_flags: string[];
  created_at: string;
}

export interface AdvisorPosition {
  advisor_id: string;
  advisor_name: string;
  stance: "support" | "oppose" | "caution" | "abstain" | "needs-data";
  summary: string;
  confidence: number;
}

// ── Layer E: Boardroom Intake Packet ────────────────────────────

export interface BoardroomIntakePacket {
  intake_id: string;
  synthesis: AppBoardSynthesis;
  evidence_refs: string[];
  file_refs: string[];
  proof_refs: string[];
  confidence_state: { overall: number; by_advisor: Record<string, number> };
  freshness_state: { last_check: string; staleness_seconds: number };
  urgency: Severity;
  reversibility: "fully" | "partially" | "irreversible";
  approval_requirement: boolean;
  blockers: string[];
  unresolved_unknowns: string[];
  simulation_candidates: string[];
  created_at: string;
}

// ── Layer G: Follow-Through Packet ──────────────────────────────

export interface FollowThroughPacket {
  packet_id: string;
  type: "approved_action" | "deferred_action" | "review_later" | "evidence_request" | "simulation_only" | "task_bundle";
  domain: Domain;
  source_receipt_id: string;
  summary: string;
  action_items: ActionItem[];
  reminder_at?: string;
  expected_outcome?: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  due_at?: string;
  status: "pending" | "in_progress" | "complete";
}

// ── Transmission Log Entry ──────────────────────────────────────

export interface TransmissionLogEntry {
  id: string;
  source_layer: string;
  destination_layer: string;
  packet_type: string;
  packet_id: string;
  timestamp: number;
  confidence: number;
  freshness: string;
  missing_data_flags: string[];
  status: "delivered" | "failed" | "dropped";
  error?: string;
}
