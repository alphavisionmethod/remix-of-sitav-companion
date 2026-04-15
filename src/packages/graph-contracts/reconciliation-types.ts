// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Reconciliation Types
// Graph drift detection, eventual consistency, canonical correction.
// ═══════════════════════════════════════════════════════════════

export type DriftSeverity = "critical" | "high" | "medium" | "low";

export type ReconciliationStrategy = "canonical_wins" | "newest_wins" | "merge" | "manual";

export interface GraphDriftReport {
  report_id: string;
  scan_scope: string[];
  discrepancies: GraphDiscrepancy[];
  total_nodes_scanned: number;
  total_edges_scanned: number;
  drift_score: number;
  scanned_at: string;
}

export interface GraphDiscrepancy {
  discrepancy_id: string;
  discrepancy_type: "missing_node" | "missing_edge" | "stale_attribute" | "orphaned_edge" | "conflicting_value" | "invalid_reference";
  severity: DriftSeverity;
  node_id?: string;
  edge_id?: string;
  field?: string;
  expected_value?: unknown;
  actual_value?: unknown;
  source_a: string;
  source_b?: string;
  detected_at: string;
}

export interface ReconciliationPlan {
  plan_id: string;
  drift_report_id: string;
  strategy: ReconciliationStrategy;
  corrections: GraphCorrection[];
  estimated_duration_ms: number;
  requires_approval: boolean;
  created_at: string;
}

export interface GraphCorrection {
  correction_id: string;
  correction_type: "create" | "update" | "delete" | "remap";
  target_type: "node" | "edge";
  target_id: string;
  field?: string;
  old_value?: unknown;
  new_value?: unknown;
  reason: string;
  reversible: boolean;
}

export interface ConsistencyRule {
  rule_id: string;
  name: string;
  description: string;
  node_types: string[];
  edge_types: string[];
  invariant: string;
  severity: DriftSeverity;
  auto_repair: boolean;
}

export interface ReconciliationReceipt {
  receipt_id: string;
  plan_id: string;
  corrections_applied: number;
  corrections_failed: number;
  corrections_skipped: number;
  duration_ms: number;
  integrity_verified: boolean;
  completed_at: string;
}
