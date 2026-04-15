// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Safety Types
// Trust boundaries, action gating, grounding, contradiction checks.
// ═══════════════════════════════════════════════════════════════

export type AIActionGateResult = "allow" | "allow_with_caveat" | "require_approval" | "block" | "refuse";

export interface AITrustBoundary {
  boundary_id: string;
  domain: string;
  field: string;
  never_from_llm: boolean;
  required_source: "deterministic" | "verified_external" | "canonical_record";
  description: string;
}

export interface AIActionGate {
  gate_id: string;
  action_type: string;
  risk_tier: string;
  confidence_threshold: number;
  requires_grounding: boolean;
  requires_human_approval: boolean;
  max_financial_impact_cents: number;
  result: AIActionGateResult;
  rationale: string;
}

export interface GroundingEnforcement {
  enforcement_id: string;
  capability_id: string;
  required_sources: string[];
  min_source_confidence: number;
  max_staleness_ms: number;
  contradiction_tolerance: "none" | "minor_only" | "all";
  ungrounded_field_action: "refuse" | "caveat" | "downgrade";
}

export interface ContradictionCheck {
  check_id: string;
  field: string;
  source_a: string;
  value_a: unknown;
  source_b: string;
  value_b: unknown;
  severity: "material" | "minor";
  resolution: "source_a_wins" | "source_b_wins" | "refuse" | "caveat";
}

export interface UnsafeOutputValidation {
  validation_id: string;
  output_type: string;
  checks: SafetyCheck[];
  overall_safe: boolean;
  blocked_fields: string[];
  caveats: string[];
}

export interface SafetyCheck {
  check_name: string;
  category: "hallucination" | "bias" | "toxicity" | "pii_leak" | "financial_risk" | "legal_risk";
  passed: boolean;
  confidence: number;
  detail?: string;
}
