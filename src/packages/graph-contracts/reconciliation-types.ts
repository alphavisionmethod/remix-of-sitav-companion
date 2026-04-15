// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Reconciliation Types (Fully Advanced)
// Drift detection, consistency rules, canonical correction,
// scheduled reconciliation, repair workflows, integrity proofs.
// ═══════════════════════════════════════════════════════════════

export type DriftSeverity = "critical" | "high" | "medium" | "low" | "info";

export type ReconciliationStrategy = "canonical_wins" | "newest_wins" | "merge" | "manual" | "quorum" | "ai_assisted";

export type ReconciliationTrigger = "scheduled" | "on_demand" | "drift_detected" | "post_migration" | "post_restore";

export interface GraphDriftReport {
  report_id: string;
  trigger: ReconciliationTrigger;
  scan_scope: string[];
  scan_depth: number;
  discrepancies: GraphDiscrepancy[];
  total_nodes_scanned: number;
  total_edges_scanned: number;
  total_lineage_chains_scanned: number;
  drift_score: number;
  drift_trend: "increasing" | "stable" | "decreasing";
  previous_drift_score?: number;
  integrity_score: number;
  anomalies: DriftAnomaly[];
  scanned_at: string;
  scan_duration_ms: number;
  next_scheduled_scan?: string;
}

export interface GraphDiscrepancy {
  discrepancy_id: string;
  discrepancy_type: "missing_node" | "missing_edge" | "stale_attribute" | "orphaned_edge" | "conflicting_value" | "invalid_reference" | "schema_violation" | "integrity_break" | "duplicate" | "circular_reference";
  severity: DriftSeverity;
  node_id?: string;
  node_type?: string;
  edge_id?: string;
  edge_type?: string;
  field?: string;
  expected_value?: unknown;
  actual_value?: unknown;
  source_a: string;
  source_b?: string;
  auto_resolvable: boolean;
  recommended_action: string;
  estimated_impact: string;
  detected_at: string;
  related_discrepancies?: string[];
}

export interface DriftAnomaly {
  anomaly_id: string;
  anomaly_type: "sudden_growth" | "mass_deletion" | "confidence_degradation" | "orphan_spike" | "schema_drift";
  description: string;
  severity: DriftSeverity;
  metric_name: string;
  expected_range: [number, number];
  actual_value: number;
  detected_at: string;
}

export interface ReconciliationPlan {
  plan_id: string;
  drift_report_id: string;
  strategy: ReconciliationStrategy;
  corrections: GraphCorrection[];
  correction_order: string[];
  estimated_duration_ms: number;
  estimated_affected_nodes: number;
  estimated_affected_edges: number;
  risk_score: number;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  dry_run_available: boolean;
  dry_run_result?: DryRunResult;
  created_at: string;
  expires_at: string;
}

export interface DryRunResult {
  success: boolean;
  corrections_simulated: number;
  corrections_would_fail: number;
  side_effects: string[];
  duration_ms: number;
  ran_at: string;
}

export interface GraphCorrection {
  correction_id: string;
  correction_type: "create" | "update" | "delete" | "remap" | "merge" | "split" | "relink";
  target_type: "node" | "edge" | "lineage_chain";
  target_id: string;
  field?: string;
  old_value?: unknown;
  new_value?: unknown;
  reason: string;
  source_discrepancy_id: string;
  reversible: boolean;
  rollback_data?: unknown;
  dependencies: string[];
  status: "pending" | "applied" | "failed" | "rolled_back" | "skipped";
  applied_at?: string;
  error_message?: string;
}

export interface ConsistencyRule {
  rule_id: string;
  name: string;
  description: string;
  category: "referential_integrity" | "schema_compliance" | "business_logic" | "temporal" | "cardinality" | "access_control";
  node_types: string[];
  edge_types: string[];
  invariant: string;
  validation_query?: string;
  severity: DriftSeverity;
  auto_repair: boolean;
  repair_strategy?: string;
  enabled: boolean;
  last_violated_at?: string;
  violation_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReconciliationReceipt {
  receipt_id: string;
  plan_id: string;
  drift_report_id: string;
  strategy_used: ReconciliationStrategy;
  trigger: ReconciliationTrigger;
  corrections_applied: number;
  corrections_failed: number;
  corrections_skipped: number;
  corrections_rolled_back: number;
  nodes_affected: number;
  edges_affected: number;
  pre_drift_score: number;
  post_drift_score: number;
  pre_integrity_score: number;
  post_integrity_score: number;
  duration_ms: number;
  integrity_verified: boolean;
  integrity_proof_hash: string;
  initiated_by: string;
  started_at: string;
  completed_at: string;
}

// ── Scheduled Reconciliation ──

export interface ReconciliationSchedule {
  schedule_id: string;
  name: string;
  cron_expression: string;
  scope: string[];
  strategy: ReconciliationStrategy;
  auto_approve: boolean;
  max_auto_corrections: number;
  notification_channels: string[];
  enabled: boolean;
  last_run_at?: string;
  next_run_at: string;
  last_run_receipt_id?: string;
}

// ── Integrity Proof ──

export interface GraphIntegrityProof {
  proof_id: string;
  scope: string[];
  merkle_root: string;
  node_hashes: Record<string, string>;
  edge_hashes: Record<string, string>;
  total_nodes: number;
  total_edges: number;
  generated_at: string;
  valid_until: string;
  verified: boolean;
}
