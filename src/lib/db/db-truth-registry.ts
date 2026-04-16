// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Truth Registry
// Canonical truth assertions — which tables are authoritative
// for which business concepts
// ═══════════════════════════════════════════════════════════════

export interface TruthAssertion {
  readonly concept: string;
  readonly authoritativeTable: string;
  readonly supportingTables: readonly string[];
  readonly description: string;
}

export const DB_TRUTH_REGISTRY: readonly TruthAssertion[] = [
  { concept: "user-identity", authoritativeTable: "profiles", supportingTables: ["os_user_accounts", "user_roles", "biometric_credentials"], description: "User identity is owned by profiles, with role separation in user_roles" },
  { concept: "trust-level", authoritativeTable: "trust_state", supportingTables: ["device_attestations", "biometric_credentials"], description: "Trust state is the single source of trust scoring" },
  { concept: "execution-proof", authoritativeTable: "receipts", supportingTables: ["proof_records", "audit_logs"], description: "Receipts are the canonical execution proof, backed by proof_records" },
  { concept: "capability-registry", authoritativeTable: "capabilities", supportingTables: [], description: "Capabilities table is the sole authority for OS capabilities" },
  { concept: "command-execution", authoritativeTable: "execution_envelopes", supportingTables: ["command_steps"], description: "Execution envelopes track command lifecycle, steps track granular progress" },
  { concept: "advisor-intelligence", authoritativeTable: "advisor_agents", supportingTables: ["advisor_board_memory", "advisor_knowledge", "advisor_board_recommendations"], description: "Advisor agents are the identity source, with separate memory and knowledge stores" },
  { concept: "business-health", authoritativeTable: "business_health_scores", supportingTables: ["deals", "invoices", "customers"], description: "Business health scores aggregate CRM and financial data" },
  { concept: "financial-state", authoritativeTable: "invoices", supportingTables: ["bills", "budgets", "reserves", "financial_documents"], description: "Invoices are the primary financial truth, with supporting expense and budget data" },
  { concept: "boardroom-decision", authoritativeTable: "boardroom_decision_receipts", supportingTables: ["boardroom_sessions", "boardroom_items", "boardroom_evidence", "boardroom_recommendations"], description: "Decision receipts are the canonical boardroom outcome" },
  { concept: "connector-state", authoritativeTable: "connector_configs", supportingTables: ["connector_credentials", "connector_tokens", "sync_logs"], description: "Connector configs define the connection, credentials store auth, tokens store active tokens" },
  { concept: "device-identity", authoritativeTable: "cloud_devices", supportingTables: ["device_attestations", "runtime_agents"], description: "Cloud devices is the device registry, attestations provide trust proofs" },
  { concept: "tenant-identity", authoritativeTable: "cloud_tenants", supportingTables: ["cloud_tenant_memberships"], description: "Tenants own the multi-tenant boundary" },
  { concept: "ai-budget", authoritativeTable: "ai_workforce_budget_classes", supportingTables: ["ai_workforce_invocations", "ai_inference_receipts"], description: "Budget classes define limits, invocations track usage" },
  { concept: "approval-flow", authoritativeTable: "approval_decisions", supportingTables: ["admin_action_confirmations", "ai_workforce_approval_queue"], description: "Approval decisions are the canonical approval record" },
  { concept: "incident-management", authoritativeTable: "incidents", supportingTables: ["audit_logs"], description: "Incidents table is the canonical incident record" },
  { concept: "timeline", authoritativeTable: "timeline_events", supportingTables: ["graph_edges"], description: "Timeline events are the canonical event stream" },
] as const;

export function getTruthForConcept(concept: string): TruthAssertion | undefined {
  return DB_TRUTH_REGISTRY.find(t => t.concept === concept);
}

export function getAuthoritativeTableForConcept(concept: string): string | undefined {
  return DB_TRUTH_REGISTRY.find(t => t.concept === concept)?.authoritativeTable;
}

export function getConceptsForTable(table: string): readonly TruthAssertion[] {
  return DB_TRUTH_REGISTRY.filter(t =>
    t.authoritativeTable === table || t.supportingTables.includes(table)
  );
}
