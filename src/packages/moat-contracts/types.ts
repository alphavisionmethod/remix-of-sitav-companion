// ═══════════════════════════════════════════════════════════════
// SITA OS — Moat Contracts: Competitive Defensibility Types
// Every moat event must be registered in generated/subject-manifest.json.
// ═══════════════════════════════════════════════════════════════

/** Metadata shared by all moat contract types */
export interface MoatContractMeta {
  producer: string;
  consumers: string[];
  sensitivity: "critical" | "confidential" | "operational";
  deterministic_validation: boolean | "partial";
  retention_class: "source-of-truth" | "operational" | "derived";
  approval_reference_required: boolean | "conditional";
  critical_binding_required: boolean;
}

/** Registered moat event categories */
export type MoatEventCategory =
  | "receipt-lock-in"
  | "sovereign-export"
  | "trust-governance"
  | "data-sovereignty"
  | "boardroom-premium"
  | "enterprise-defensibility";

export interface MoatEvent {
  id: string;
  category: MoatEventCategory;
  timestamp: string;
  entity_id: string;
  entity_type: string;
  domain: string;
  payload: Record<string, unknown>;
  proof_hash?: string;
  meta: MoatContractMeta;
}

/** Tracks progression from simulation to live execution */
export interface SimulationToLiveConversion {
  id: string;
  simulation_id: string;
  live_execution_id?: string;
  stage: "simulated" | "approved-for-live" | "executing" | "completed" | "rolled-back";
  confidence: number;
  conversion_timestamp?: string;
  delta_from_simulation: Record<string, unknown>;
  meta: MoatContractMeta;
}

/** Sovereign export readiness and integrity */
export interface SovereignExportPack {
  id: string;
  user_id: string;
  export_format: "json" | "csv" | "pdf" | "full-archive";
  tables_included: string[];
  total_records: number;
  integrity_hash: string;
  completeness_score: number;
  created_at: string;
  download_url?: string;
  meta: MoatContractMeta;
}

/** Deterministic export completeness metric */
export interface ExportReadinessScore {
  user_id: string;
  overall_score: number;
  table_scores: Record<string, number>;
  missing_exports: string[];
  last_evaluated_at: string;
  recommendations: string[];
  meta: MoatContractMeta;
}

/** Integrity verification for sovereign exports */
export interface ExportIntegrityReport {
  export_pack_id: string;
  verified_at: string;
  hash_match: boolean;
  record_count_match: boolean;
  schema_intact: boolean;
  discrepancies: Array<{ table: string; issue: string }>;
  overall_integrity: "intact" | "degraded" | "failed";
  meta: MoatContractMeta;
}

/** Gap analysis vs generic AI tooling */
export interface CompetitiveGapAnalysis {
  id: string;
  evaluated_at: string;
  competitor_class: string;
  dimensions: Array<{
    dimension: string;
    sita_score: number;
    competitor_score: number;
    moat_strength: "strong" | "moderate" | "weak" | "parity";
    notes: string;
  }>;
  overall_moat_score: number;
  defensibility_summary: string;
  meta: MoatContractMeta;
}

/** Premium value proposition metrics for boardroom */
export interface BoardroomPremiumValue {
  id: string;
  evaluated_at: string;
  proof_density: number;
  governed_action_count: number;
  receipt_coverage: number;
  trust_posture_score: number;
  premium_features_active: string[];
  value_vs_generic: number;
  meta: MoatContractMeta;
}

/** Governed execution proof density */
export interface ProofOfDensityProfile {
  user_id: string;
  period: string;
  total_actions: number;
  governed_actions: number;
  receipted_actions: number;
  verified_actions: number;
  density_ratio: number;
  trend: "increasing" | "stable" | "declining";
  meta: MoatContractMeta;
}

/** Institutional/family-office trust expectations */
export interface TrustPostureReport {
  user_id: string;
  generated_at: string;
  overall_posture: "institutional-grade" | "professional" | "standard" | "below-standard";
  dimensions: {
    data_sovereignty: number;
    audit_completeness: number;
    approval_coverage: number;
    receipt_density: number;
    verification_rate: number;
    encryption_posture: number;
  };
  gaps: Array<{ area: string; severity: "critical" | "high" | "medium"; recommendation: string }>;
  meets_institutional_requirements: boolean;
  meta: MoatContractMeta;
}

/** Visibility tiers, leakage incidents, approved-information posture */
export interface DataSovereigntyReport {
  user_id: string;
  generated_at: string;
  visibility_tiers: Record<string, "public" | "internal" | "confidential" | "restricted">;
  leakage_incidents: Array<{ timestamp: string; table: string; severity: string; resolved: boolean }>;
  approved_information_posture: "locked-down" | "controlled" | "open";
  privacy_score: number;
  meta: MoatContractMeta;
}

/** Legal/forensic summary of governed actions and proof lineage */
export interface GovernedExecutionSummary {
  user_id: string;
  period: string;
  generated_at: string;
  total_governed_actions: number;
  proof_chain_complete: boolean;
  actions: Array<{
    action_id: string;
    type: string;
    timestamp: string;
    approval_id?: string;
    receipt_id?: string;
    verification_status: "verified" | "pending" | "failed";
  }>;
  forensic_ready: boolean;
  meta: MoatContractMeta;
}

/** Measures progression from observe to delegated-recurring execution */
export interface AdoptionMetric {
  user_id: string;
  feature: string;
  current_stage: "observe" | "suggest" | "approve-execute" | "delegated-single" | "delegated-recurring";
  stage_entered_at: string;
  confidence_at_stage: number;
  total_executions: number;
  successful_executions: number;
  escalations: number;
  trust_earned: number;
  meta: MoatContractMeta;
}
