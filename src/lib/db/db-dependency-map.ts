// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Dependency Map
// Foreign key and logical dependency graph
// ═══════════════════════════════════════════════════════════════

export interface TableDependency {
  readonly from: string;
  readonly to: string;
  readonly type: "foreign_key" | "logical";
  readonly column: string;
}

export const DB_DEPENDENCY_MAP: readonly TableDependency[] = [
  // Foreign key dependencies (from types.ts Relationships)
  { from: "advisor_board_actions", to: "advisor_board_recommendations", type: "foreign_key", column: "recommendation_id" },
  { from: "advisor_board_reflections", to: "advisor_board_recommendations", type: "foreign_key", column: "recommendation_id" },
  { from: "advisor_board_tool_executions", to: "advisor_board_actions", type: "foreign_key", column: "action_id" },
  { from: "ai_workforce_outputs", to: "ai_workforce_invocations", type: "foreign_key", column: "invocation_id" },
  { from: "ai_workforce_recommendations", to: "ai_workforce_invocations", type: "foreign_key", column: "invocation_id" },
  { from: "ai_workforce_recommendation_scores", to: "ai_workforce_recommendations", type: "foreign_key", column: "recommendation_id" },
  { from: "ai_workforce_approval_queue", to: "ai_workforce_recommendations", type: "foreign_key", column: "recommendation_id" },
  { from: "boardroom_items", to: "boardroom_sessions", type: "foreign_key", column: "session_id" },
  { from: "boardroom_evidence", to: "boardroom_items", type: "foreign_key", column: "item_id" },
  { from: "boardroom_recommendations", to: "boardroom_items", type: "foreign_key", column: "item_id" },
  { from: "boardroom_recommendations", to: "boardroom_sessions", type: "foreign_key", column: "session_id" },
  { from: "boardroom_decision_receipts", to: "boardroom_items", type: "foreign_key", column: "item_id" },
  { from: "boardroom_decision_receipts", to: "boardroom_recommendations", type: "foreign_key", column: "recommendation_id" },
  { from: "boardroom_decision_receipts", to: "boardroom_sessions", type: "foreign_key", column: "session_id" },

  // Logical dependencies (referenced by business logic, not FK)
  { from: "execution_envelopes", to: "capabilities", type: "logical", column: "capability_id" },
  { from: "trust_state", to: "profiles", type: "logical", column: "user_id" },
  { from: "receipts", to: "execution_envelopes", type: "logical", column: "entity_id" },
  { from: "command_steps", to: "execution_envelopes", type: "logical", column: "envelope_id" },
  { from: "connector_credentials", to: "connector_configs", type: "logical", column: "connector_id" },
  { from: "connector_tokens", to: "connector_credentials", type: "logical", column: "credential_id" },
  { from: "sync_logs", to: "connector_configs", type: "logical", column: "connector_id" },
  { from: "device_attestations", to: "cloud_devices", type: "logical", column: "device_id" },
  { from: "runtime_agents", to: "cloud_devices", type: "logical", column: "device_id" },
  { from: "cloud_tenant_memberships", to: "cloud_tenants", type: "logical", column: "tenant_id" },
  { from: "org_members", to: "organizations", type: "logical", column: "org_id" },
  { from: "advisor_board_memory", to: "advisor_agents", type: "logical", column: "advisor_id" },
  { from: "advisor_knowledge", to: "advisor_agents", type: "logical", column: "advisor_id" },
  { from: "approval_decisions", to: "ai_workforce_approval_queue", type: "logical", column: "request_id" },
] as const;

export function getDependenciesForTable(table: string): readonly TableDependency[] {
  return DB_DEPENDENCY_MAP.filter(d => d.from === table);
}

export function getDependentsOfTable(table: string): readonly TableDependency[] {
  return DB_DEPENDENCY_MAP.filter(d => d.to === table);
}

export function getTablesWithNoDependencies(): string[] {
  const allFroms = new Set(DB_DEPENDENCY_MAP.map(d => d.from));
  const allTos = new Set(DB_DEPENDENCY_MAP.map(d => d.to));
  const allTables = new Set([...allFroms, ...allTos]);
  return [...allTables].filter(t => !DB_DEPENDENCY_MAP.some(d => d.from === t));
}
