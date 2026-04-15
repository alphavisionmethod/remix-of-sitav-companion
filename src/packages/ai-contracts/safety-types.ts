// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Safety Types (Production-Grade)
// Trust boundaries, action gating, grounding enforcement,
// contradiction checks, epistemic firewall, negative receipts.
// ═══════════════════════════════════════════════════════════════

export type AIActionGateResult = "allow" | "allow_with_caveat" | "allow_monitored" | "require_approval" | "require_dual_approval" | "block" | "refuse" | "defer";

export type SafetyCheckCategory =
  | "hallucination" | "bias" | "toxicity" | "pii_leak"
  | "financial_risk" | "legal_risk" | "factuality"
  | "consistency" | "completeness" | "authority_claim"
  | "manipulation" | "confidentiality_breach";

export type GroundingLevel = "fully_grounded" | "partially_grounded" | "ungrounded" | "contradicted" | "stale";

// ── Trust Boundaries ──

export interface AITrustBoundary {
  boundary_id: string;
  domain: string;
  field: string;
  never_from_llm: boolean;
  required_source: "deterministic" | "verified_external" | "canonical_record" | "user_input" | "calculated";
  required_freshness_ms?: number;
  override_requires: "none" | "human_approval" | "dual_approval" | "founder_approval";
  violation_action: "refuse" | "caveat" | "downgrade" | "log_only";
  description: string;
  rationale: string;
  regulatory_basis?: string;
  severity: "critical" | "high" | "medium" | "low";
  created_at: string;
  updated_at: string;
}

// ── Action Gating ──

export interface AIActionGate {
  gate_id: string;
  action_type: string;
  domain: string;
  risk_tier: string;
  confidence_threshold: number;
  evidence_threshold: number;
  requires_grounding: boolean;
  requires_human_approval: boolean;
  requires_dual_approval: boolean;
  max_financial_impact_cents: number;
  max_affected_entities: number;
  cooldown_seconds: number;
  time_window_restrictions?: TimeWindowRestriction[];
  prerequisite_checks: string[];
  result: AIActionGateResult;
  rationale: string;
  override_policy: OverridePolicy;
  audit_level: "full" | "summary" | "minimal";
}

export interface TimeWindowRestriction {
  type: "business_hours_only" | "quiet_hours_blocked" | "custom";
  start_hour_utc?: number;
  end_hour_utc?: number;
  days_of_week?: number[];
}

export interface OverridePolicy {
  overridable: boolean;
  override_requires: "founder" | "admin_dual" | "emergency_protocol";
  override_expires_hours: number;
  max_overrides_per_day: number;
}

// ── Grounding Enforcement ──

export interface GroundingEnforcement {
  enforcement_id: string;
  capability_id: string;
  domain: string;
  required_sources: GroundingSource[];
  min_source_confidence: number;
  min_source_count: number;
  max_staleness_ms: number;
  contradiction_tolerance: "none" | "minor_only" | "all";
  ungrounded_field_action: "refuse" | "caveat" | "downgrade" | "omit";
  cross_reference_required: boolean;
  chain_of_custody_required: boolean;
  verification_method: "cite_check" | "evidence_grade" | "assumption_audit" | "all";
}

export interface GroundingSource {
  source_type: "database" | "api" | "document" | "calculation" | "user_input" | "external_verified";
  source_id: string;
  min_confidence: number;
  max_age_ms: number;
  required: boolean;
  weight: number;
}

export interface GroundingResult {
  field: string;
  level: GroundingLevel;
  sources_found: number;
  sources_required: number;
  best_source_confidence: number;
  stalest_source_age_ms: number;
  contradictions_found: number;
  grounding_chain: GroundingChainLink[];
  recommendation: "use" | "caveat" | "refuse" | "verify_manually";
}

export interface GroundingChainLink {
  source_id: string;
  source_type: string;
  confidence: number;
  retrieved_at: string;
  value: unknown;
  hash?: string;
}

// ── Contradiction Checks ──

export interface ContradictionCheck {
  check_id: string;
  field: string;
  domain: string;
  source_a: ContradictionSource;
  source_b: ContradictionSource;
  severity: "material" | "significant" | "minor" | "cosmetic";
  resolution: "source_a_wins" | "source_b_wins" | "refuse" | "caveat" | "escalate" | "newest_wins";
  resolution_rationale: string;
  auto_resolvable: boolean;
  escalation_required: boolean;
  detected_at: string;
}

export interface ContradictionSource {
  source_id: string;
  source_type: string;
  value: unknown;
  confidence: number;
  timestamp: string;
  provenance: string;
}

// ── Safety Checks ──

export interface UnsafeOutputValidation {
  validation_id: string;
  output_type: string;
  capability_id: string;
  model_used: string;
  checks: SafetyCheck[];
  overall_safe: boolean;
  overall_confidence: number;
  blocked_fields: string[];
  caveats: CaveatEntry[];
  remediation_applied: RemediationAction[];
  validation_duration_ms: number;
  validated_at: string;
}

export interface SafetyCheck {
  check_id: string;
  check_name: string;
  category: SafetyCheckCategory;
  passed: boolean;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  detail?: string;
  evidence?: string;
  remediation_available: boolean;
  remediation_action?: string;
}

export interface CaveatEntry {
  field: string;
  caveat_type: "staleness" | "low_confidence" | "single_source" | "partial_grounding" | "minor_contradiction" | "assumption";
  message: string;
  severity: "warning" | "info";
}

export interface RemediationAction {
  action_type: "redact" | "replace" | "caveat" | "downgrade" | "omit" | "flag";
  field: string;
  original_value?: unknown;
  remediated_value?: unknown;
  reason: string;
}

// ── Epistemic Firewall ──

export interface EpistemicFirewallConfig {
  enabled: boolean;
  domains: EpistemicDomainRule[];
  global_hallucination_threshold: number;
  global_confidence_floor: number;
  require_evidence_grade_min: "A" | "B" | "C" | "D";
  assumption_registry_enabled: boolean;
  negative_receipt_enabled: boolean;
  cite_checker_enabled: boolean;
}

export interface EpistemicDomainRule {
  domain: string;
  hallucination_threshold: number;
  min_evidence_grade: "A" | "B" | "C" | "D" | "F";
  require_cite_check: boolean;
  require_assumption_audit: boolean;
  prohibited_claim_types: string[];
  max_assumption_count: number;
}

// ── Negative Receipts ──

export interface NegativeReceipt {
  receipt_id: string;
  action_type: string;
  requested_by: string;
  refused_at: string;
  refusal_reason: string;
  policy_violated: string;
  gate_result: AIActionGateResult;
  remediation_path: string;
  evidence_snapshot: Record<string, unknown>;
  escalation_available: boolean;
  escalation_target?: string;
  expires_at?: string;
}

// ── Safety Report ──

export interface AISafetyReport {
  report_id: string;
  period: string;
  total_validations: number;
  total_blocks: number;
  total_caveats: number;
  total_remediations: number;
  hallucination_rate: number;
  contradiction_rate: number;
  grounding_coverage: number;
  negative_receipts_issued: number;
  safety_by_category: Record<SafetyCheckCategory, { total: number; passed: number; failed: number }>;
  top_violated_boundaries: string[];
  improvement_recommendations: string[];
  generated_at: string;
}
