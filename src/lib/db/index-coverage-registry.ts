// ═══════════════════════════════════════════════════════════════
// SITA OS — Index Coverage Registry
// Declares expected indexes per table family
// ═══════════════════════════════════════════════════════════════

export type IndexType = "btree" | "gin" | "gist" | "hash" | "brin";
export type IndexPriority = "critical" | "high" | "medium" | "low";

export interface ExpectedIndex {
  readonly table: string;
  readonly columns: string[];
  readonly indexType: IndexType;
  readonly priority: IndexPriority;
  readonly rationale: string;
}

export const EXPECTED_INDEXES: readonly ExpectedIndex[] = [
  // TTL/expires_at indexes (critical for cleanup jobs)
  { table: "admin_sessions", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "os_sessions", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "os_elevation_tokens", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "ai_invocations", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "ai_usage_ledger", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "ai_budget_alerts", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "ai_inference_receipts", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "ai_receipt_records", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "TTL cleanup scan" },
  { table: "connector_tokens", columns: ["expires_at"], indexType: "btree", priority: "critical", rationale: "Token refresh lookup" },
  { table: "account_deletion_requests", columns: ["scheduled_purge_at"], indexType: "btree", priority: "critical", rationale: "Purge scheduling" },
  { table: "admin_action_confirmations", columns: ["cooldown_expires_at"], indexType: "btree", priority: "high", rationale: "Cooldown lookup" },
  // Tenant isolation indexes (user_id on high-volume tables)
  { table: "timeline_events", columns: ["user_id", "created_at"], indexType: "btree", priority: "critical", rationale: "Tenant-scoped timeline query" },
  { table: "audit_logs", columns: ["user_id", "created_at"], indexType: "btree", priority: "critical", rationale: "Tenant-scoped audit query" },
  { table: "ai_workforce_invocations", columns: ["user_id", "created_at"], indexType: "btree", priority: "high", rationale: "Tenant-scoped invocation query" },
  { table: "sync_logs", columns: ["user_id", "created_at"], indexType: "btree", priority: "high", rationale: "Tenant-scoped sync query" },
  // Status/workflow indexes
  { table: "execution_envelopes", columns: ["status"], indexType: "btree", priority: "high", rationale: "Workflow status filter" },
  { table: "approval_decisions", columns: ["status"], indexType: "btree", priority: "high", rationale: "Approval status lookup" },
  { table: "connector_sync_runs", columns: ["status"], indexType: "btree", priority: "high", rationale: "Sync run status filter" },
  { table: "support_cases", columns: ["status", "user_id"], indexType: "btree", priority: "high", rationale: "Support case lookup" },
  { table: "incidents", columns: ["status"], indexType: "btree", priority: "high", rationale: "Incident status lookup" },
  // FK indexes
  { table: "advisor_board_actions", columns: ["recommendation_id"], indexType: "btree", priority: "medium", rationale: "FK join performance" },
  { table: "advisor_board_reflections", columns: ["recommendation_id"], indexType: "btree", priority: "medium", rationale: "FK join performance" },
  { table: "ai_action_receipts", columns: ["invocation_id"], indexType: "btree", priority: "medium", rationale: "FK join performance" },
  { table: "ai_prompt_versions", columns: ["family_id"], indexType: "btree", priority: "medium", rationale: "FK join performance" },
  { table: "command_steps", columns: ["user_id"], indexType: "btree", priority: "medium", rationale: "Tenant query performance" },
];

export function getExpectedIndexesForTable(table: string): readonly ExpectedIndex[] {
  return EXPECTED_INDEXES.filter(e => e.table === table);
}

export function getCriticalMissingIndexes(): readonly ExpectedIndex[] {
  return EXPECTED_INDEXES.filter(e => e.priority === "critical");
}